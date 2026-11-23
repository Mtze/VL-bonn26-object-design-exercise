// Data Transfer Objects: das, was die Fassade nach außen gibt.
// Eigene Typen statt der Entities, damit das interne Modell verborgen bleibt.
// Wird die Fassade zur HTTP-API, gehen genau diese Objekte über das Netz.
import type { GruppenId } from './model.ts'

export interface GruppeDto {
  id: GruppenId
  name: string
  beschreibung: string
}

export interface MitgliedDto {
  name: string
}
