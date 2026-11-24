import { randomUUID } from 'node:crypto'
import type { Gruppe, GruppenId, Mitgliedschaft, StudiId, Studierende } from './model.ts'
import { Tabelle } from './tabelle.ts'

// Control: verwaltet, wer Mitglied welcher Gruppe ist.
// Variante A: Mitgliedschaften liegen in einer eigenen Tabelle.
export class MitgliederService {
  private gruppen: Tabelle<Gruppe>
  private studierende: Tabelle<Studierende>
  private mitgliedschaften = new Tabelle<Mitgliedschaft>()

  constructor(gruppen: Tabelle<Gruppe>, studierende: Tabelle<Studierende>) {
    this.gruppen = gruppen
    this.studierende = studierende
  }

  // Studierende treten einer Gruppe bei. Ein erneuter Beitritt ändert nichts.
  beitreten(studiId: StudiId, gruppeId: GruppenId): void {
    this.gruppePruefen(gruppeId)
    if (!this.studierende.finden(studiId)) {
      throw new Error('Person nicht gefunden.')
    }
    if (this.mitgliedschaft(studiId, gruppeId)) return
    this.mitgliedschaften.speichern({ id: randomUUID(), gruppeId, studiId })
  }

  // Studierende verlassen eine Gruppe. Ohne Mitgliedschaft passiert nichts.
  verlassen(studiId: StudiId, gruppeId: GruppenId): void {
    const mitgliedschaft = this.mitgliedschaft(studiId, gruppeId)
    if (mitgliedschaft) this.mitgliedschaften.entfernen(mitgliedschaft.id)
  }

  // Liefert alle Mitglieder einer Gruppe.
  anzeigen(gruppeId: GruppenId): Studierende[] {
    this.gruppePruefen(gruppeId)
    return this.mitgliedschaften
      .alle()
      .filter(m => m.gruppeId === gruppeId)
      .map(m => this.studierende.finden(m.studiId))
      .filter(s => s !== undefined)
  }

  istMitglied(studiId: StudiId, gruppeId: GruppenId): boolean {
    return this.mitgliedschaft(studiId, gruppeId) !== undefined
  }

  // Entfernt alle Mitgliedschaften einer Gruppe, zum Beispiel bevor die Gruppe gelöscht wird.
  alleEntfernen(gruppeId: GruppenId): void {
    for (const mitgliedschaft of this.mitgliedschaften.alle()) {
      if (mitgliedschaft.gruppeId === gruppeId) this.mitgliedschaften.entfernen(mitgliedschaft.id)
    }
  }

  private mitgliedschaft(studiId: StudiId, gruppeId: GruppenId): Mitgliedschaft | undefined {
    return this.mitgliedschaften.alle().find(m => m.gruppeId === gruppeId && m.studiId === studiId)
  }

  private gruppePruefen(gruppeId: GruppenId): void {
    if (!this.gruppen.finden(gruppeId)) {
      throw new Error('Gruppe nicht gefunden.')
    }
  }
}
