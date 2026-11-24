// Kleines Programm zum Ausprobieren: npm start
// Es nutzt nur die öffentliche Schnittstelle aus index.ts, also die Fassade.
import { gruppenSubsystemErstellen } from './index.ts'
import type { MitgliedDto } from './index.ts'

// Feste UUIDs für die beiden Beispielpersonen.
const annaId = '11111111-1111-4111-8111-111111111111'
const benId = '22222222-2222-4222-8222-222222222222'

const fassade = gruppenSubsystemErstellen([
  { id: annaId, name: 'Anna', matrikelnummer: '3012345' },
  { id: benId, name: 'Ben', matrikelnummer: '3012346' },
])

const namen = (liste: MitgliedDto[]) => liste.map(m => m.name).join(', ') || '(keine)'

try {
  // Anna legt die Gruppe an und ist damit ihr erstes Mitglied.
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', 'Gemeinsam für die Klausur lernen')
  console.log(`Gruppe angelegt: ${gruppe.name}`)

  fassade.beitreten(benId, gruppe.id)
  console.log(`Mitglieder: ${namen(fassade.mitgliederAnzeigen(annaId, gruppe.id))}`)

  fassade.verlassen(benId, gruppe.id)
  console.log(`Nach dem Austritt von Ben: ${namen(fassade.mitgliederAnzeigen(annaId, gruppe.id))}`)

  // Ben ist kein Mitglied mehr und sieht die Gruppe deshalb nicht.
  try {
    fassade.anzeigen(benId, gruppe.id)
  } catch (fehler) {
    console.log(`Ben fragt die Gruppe an: ${fehler instanceof Error ? fehler.message : String(fehler)}`)
  }
} catch (fehler) {
  console.error(`Abbruch: ${fehler instanceof Error ? fehler.message : String(fehler)}`)
  process.exitCode = 1
}
