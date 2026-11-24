import type { GruppeDto, MitgliedDto } from './dto.ts'
import type { Gruppe, GruppenId, StudiId } from './model.ts'
import type { GruppenService } from './gruppen-service.ts'
import type { MitgliederService } from './mitglieder-service.ts'

// Fassade: einziger Zugang zum Gruppen-Subsystem von außen.
// Jede Operation kennt die handelnde Person (akteur) und prüft ihre Mitgliedschaft.
// Die Dienste dahinter bleiben unverändert und sind nur noch intern erreichbar.
// Nach außen gehen nur DTOs, nie die gespeicherten Entities.
export class GruppenFassade {
  private gruppen: GruppenService
  private mitglieder: MitgliederService

  constructor(gruppen: GruppenService, mitglieder: MitgliederService) {
    this.gruppen = gruppen
    this.mitglieder = mitglieder
  }

  // Wer eine Gruppe anlegt, wird ihr erstes Mitglied.
  anlegen(akteur: StudiId, name: string, beschreibung: string): GruppeDto {
    const gruppe = this.gruppen.anlegen(name, beschreibung)
    try {
      this.mitglieder.beitreten(akteur, gruppe.id)
    } catch (fehler) {
      // Keine Gruppe ohne Mitglied zurücklassen.
      this.gruppen.loeschen(gruppe.id)
      throw fehler
    }
    return this.gruppeDto(gruppe)
  }

  anzeigen(akteur: StudiId, gruppeId: GruppenId): GruppeDto {
    this.mitgliedschaftPruefen(akteur, gruppeId)
    return this.gruppeDto(this.gruppen.anzeigen(gruppeId))
  }

  // GruppenService kennt keine Mitgliedschaften. Ohne dieses Aufräumen
  // blieben verwaiste Mitgliedschaften einer gelöschten Gruppe zurück.
  loeschen(akteur: StudiId, gruppeId: GruppenId): void {
    this.mitgliedschaftPruefen(akteur, gruppeId)
    this.mitglieder.alleEntfernen(gruppeId)
    this.gruppen.loeschen(gruppeId)
  }

  beitreten(akteur: StudiId, gruppeId: GruppenId): void {
    this.mitglieder.beitreten(akteur, gruppeId)
  }

  verlassen(akteur: StudiId, gruppeId: GruppenId): void {
    this.mitglieder.verlassen(akteur, gruppeId)
  }

  mitgliederAnzeigen(akteur: StudiId, gruppeId: GruppenId): MitgliedDto[] {
    this.mitgliedschaftPruefen(akteur, gruppeId)
    return this.mitglieder.anzeigen(gruppeId).map(s => ({ name: s.name }))
  }

  // Neues Objekt statt der gespeicherten Entity: Änderungen des Aufrufers erreichen den Speicher nicht.
  private gruppeDto(gruppe: Gruppe): GruppeDto {
    return { id: gruppe.id, name: gruppe.name, beschreibung: gruppe.beschreibung }
  }

  // Unbekannte und fremde Gruppen ergeben denselben Fehler.
  // So verrät die Antwort nicht, ob eine Gruppe existiert.
  private mitgliedschaftPruefen(akteur: StudiId, gruppeId: GruppenId): void {
    if (!this.mitglieder.istMitglied(akteur, gruppeId)) {
      throw new Error('Kein Zugriff auf diese Gruppe.')
    }
  }
}
