// Neue Tests für F-01 und F-05: Nur Mitglieder sehen Gruppendaten.
// Die bestehenden Tests für GruppenService und MitgliederService bleiben unverändert grün.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gruppenSubsystemErstellen } from '../src/index.ts'
import { GruppenFassade } from '../src/gruppen-fassade.ts'
import { GruppenService } from '../src/gruppen-service.ts'
import { MitgliederService } from '../src/mitglieder-service.ts'
import { Tabelle } from '../src/tabelle.ts'
import type { Gruppe, Studierende } from '../src/model.ts'
import { anna, ben, annaId, benId, unbekannteGruppeId, unbekanntePersonId } from './testdaten.ts'

test('wer eine Gruppe anlegt, ist Mitglied und sieht sie', () => {
  const fassade = gruppenSubsystemErstellen([anna, ben])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  assert.deepEqual(fassade.anzeigen(annaId, gruppe.id), gruppe)
  assert.deepEqual(fassade.mitgliederAnzeigen(annaId, gruppe.id), [{ name: 'Anna' }])
})

test('Nicht-Mitglieder sehen weder Gruppe noch Mitglieder', () => {
  const fassade = gruppenSubsystemErstellen([anna, ben])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  assert.throws(() => fassade.anzeigen(benId, gruppe.id), /Kein Zugriff/)
  assert.throws(() => fassade.mitgliederAnzeigen(benId, gruppe.id), /Kein Zugriff/)
  assert.throws(() => fassade.loeschen(benId, gruppe.id), /Kein Zugriff/)
})

test('unbekannte Gruppen ergeben denselben Fehler wie fremde', () => {
  const fassade = gruppenSubsystemErstellen([anna])
  assert.throws(() => fassade.anzeigen(annaId, unbekannteGruppeId), /Kein Zugriff/)
})

test('nach dem Beitritt sieht die Person die Gruppe, nach dem Verlassen nicht mehr', () => {
  const fassade = gruppenSubsystemErstellen([anna, ben])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  fassade.beitreten(benId, gruppe.id)
  assert.equal(fassade.anzeigen(benId, gruppe.id).id, gruppe.id)
  fassade.verlassen(benId, gruppe.id)
  assert.throws(() => fassade.anzeigen(benId, gruppe.id), /Kein Zugriff/)
})

test('Mitglieder dürfen ihre Gruppe löschen', () => {
  const fassade = gruppenSubsystemErstellen([anna])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  fassade.loeschen(annaId, gruppe.id)
  assert.throws(() => fassade.anzeigen(annaId, gruppe.id), /Kein Zugriff/)
})

test('scheitert der Beitritt beim Anlegen, bleibt keine Gruppe zurück', () => {
  const gruppen = new Tabelle<Gruppe>()
  const fassade = new GruppenFassade(
    new GruppenService(gruppen),
    new MitgliederService(gruppen, new Tabelle<Studierende>()),
  )
  assert.throws(() => fassade.anlegen(unbekanntePersonId, 'Algorithmenrunde', ''), /nicht gefunden/)
  assert.deepEqual(gruppen.alle(), [])
})

test('ändert ein Aufrufer die Antwort, bleibt die gespeicherte Gruppe unverändert', () => {
  const fassade = gruppenSubsystemErstellen([anna])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  const antwort = fassade.anzeigen(annaId, gruppe.id)
  antwort.name = 'geändert'
  assert.equal(fassade.anzeigen(annaId, gruppe.id).name, 'Algorithmenrunde')
})

test('die Mitgliederliste verrät weder Matrikelnummern noch interne IDs', () => {
  const fassade = gruppenSubsystemErstellen([anna, ben])
  const gruppe = fassade.anlegen(annaId, 'Algorithmenrunde', '')
  fassade.beitreten(benId, gruppe.id)
  const mitglieder = fassade.mitgliederAnzeigen(annaId, gruppe.id)
  assert.deepEqual(mitglieder, [{ name: 'Anna' }, { name: 'Ben' }])
  assert.ok(!JSON.stringify(mitglieder).includes('3012345'))
})
