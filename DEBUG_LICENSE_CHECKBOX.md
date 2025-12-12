# Debug: License Checkbox Issue

## Cosa Verificare

Per capire dove sta il problema, controlla questi 3 scenari:

### Scenario 1: Problema Visivo (UI)
**Test**: Clicca sul checkbox di una licenza per deselezionarla
- ✅ Se il check scompare visivamente → vai allo Scenario 2
- ❌ Se il check rimane → problema di rendering React

### Scenario 2: Problema di State
**Test**: Deseleziona un checkbox, poi guarda l'input price a destra
- ✅ Se l'input price scompare → stato funziona, vai allo Scenario 3
- ❌ Se l'input price rimane visibile → problema state management

### Scenario 3: Problema Backend
**Test**: Deseleziona una licenza, fai submit del beat, controlla nel database
- ✅ Se la licenza NON appare nel beat creato → tutto OK
- ❌ Se la licenza appare ancora → problema nel submit

---

## Console Browser

Apri la Console (F12 → Console) e cerca **errori rossi**.

Se vedi errori, copiameli e li sistemo.

---

## Quale scenario stai vedendo?

Dimmi il numero (1, 2, o 3) così so dove intervenire!
