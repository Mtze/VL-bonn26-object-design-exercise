// Data Transfer Objects: das, was die Fassade nach außen gibt.
// Eigene Typen statt der Entities, damit das interne Modell verborgen bleibt.
// Wird die Fassade zur HTTP-API, gehen genau diese Objekte über das Netz.
import type { GruppenId, StudiId } from './model.ts'

export interface GruppeDto {
  id: GruppenId
  name: string
  beschreibung: string
}

export interface MitgliedDto {
  name: string
}

// Eingabe von außen: die Studierenden, die das Subsystem kennen soll.
// Das Subsystem kopiert sie in eigene Entities, der Aufrufer behält keinen Zugriff darauf.
export interface StudierendeDto {
  id: StudiId
  name: string
  matrikelnummer: string
}
