// Kleines Programm zum Ausprobieren: npm start
// Es legt eine Gruppe an, lässt zwei Personen beitreten und eine wieder austreten.
import { GruppenService } from './gruppen-service.ts'
import { MitgliederService } from './mitglieder-service.ts'
import { Tabelle } from './tabelle.ts'
import type { Gruppe, Studierende } from './model.ts'

const gruppenTabelle = new Tabelle<Gruppe>()
const studierende = new Tabelle<Studierende>([
  { id: 'anna', name: 'Anna', matrikelnummer: '3012345' },
  { id: 'ben', name: 'Ben', matrikelnummer: '3012346' },
])
const gruppen = new GruppenService(gruppenTabelle)
const mitglieder = new MitgliederService(gruppenTabelle, studierende)

const namen = (liste: Studierende[]) => liste.map(s => s.name).join(', ') || '(keine)'

try {
  const gruppe = gruppen.anlegen('Algorithmenrunde', 'Gemeinsam für die Klausur lernen')
  console.log(`Gruppe angelegt: ${gruppe.name}`)

  mitglieder.beitreten(gruppe.id, 'anna')
  mitglieder.beitreten(gruppe.id, 'ben')
  console.log(`Mitglieder: ${namen(mitglieder.anzeigen(gruppe.id))}`)

  mitglieder.verlassen(gruppe.id, 'ben')
  console.log(`Nach dem Austritt von Ben: ${namen(mitglieder.anzeigen(gruppe.id))}`)
} catch (fehler) {
  // Solange E1 offen ist, endet das Programm hier mit der TODO-Meldung.
  console.error(`Abbruch: ${fehler instanceof Error ? fehler.message : String(fehler)}`)
  process.exitCode = 1
}
