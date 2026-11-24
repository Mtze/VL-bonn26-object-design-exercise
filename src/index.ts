// Öffentliche Schnittstelle des Gruppen-Subsystems.
// Nach dem Refactoring ist nur noch die Fassade erreichbar.
// GruppenService und MitgliederService werden nicht mehr exportiert.
import { GruppenFassade } from './gruppen-fassade.ts'
import { GruppenService } from './gruppen-service.ts'
import { MitgliederService } from './mitglieder-service.ts'
import { Tabelle } from './tabelle.ts'
import type { PersonDto } from './dto.ts'
import type { Gruppe, Studierende } from './model.ts'

export function gruppenSubsystemErstellen(personen: PersonDto[]): GruppenFassade {
  const gruppen = new Tabelle<Gruppe>()
  const studierende = new Tabelle<Studierende>(personen.map(person => ({ ...person })))
  return new GruppenFassade(new GruppenService(gruppen), new MitgliederService(gruppen, studierende))
}

// Entities wie Gruppe oder Studierende werden nicht exportiert, nur DTOs.
export type { GruppenFassade } from './gruppen-fassade.ts'
export type { GruppeDto, MitgliedDto, PersonDto } from './dto.ts'
export type { GruppenId, StudiId } from './model.ts'
