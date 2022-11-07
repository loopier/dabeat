# Especificacions

07.11.2022

## User interface

Variables que pot modificar l'usuari:

- random global: randomitzar tot
- complexitat del beat: afecta al delay de la bateria [0-5]
- complexitat del sample: tria si sona només el sample greu, o l'agut i el greu
- número de sample

Els valors aleatoris són pseudo-random, i s'alimenten amb un `seed`. 

Si es posa el mateix `seed` el resultat ha de ser el mateix.

## Arxius

- Els arxius d'audio són en format `.wav`.
- Estaran allotjats al servidor.
- (opcional) L'usuari podrà carregar els seus propis samples.

Hi ha tres tipus de sample: `bateria`, `starters` i `veu`.

Els samples de bateria s'organitzen en tres grups:

- `snares`: snares, snaps i claps
- `kicks`
- `hats`

Els samples llargs són agafats de temes existents:

- `starters`: samples curats perquè sonin bé
- `starters-def`: samples sense curar
- `veu`: samples de veu

## Implementació

### tempo
El tempo ha de ser aleatori: **[86-98] bpm**

### 

Poden sonar fins a 4 "tracks" alhora: `bateria`, `aguts`, `greus`, i `veus`.

- `aguts` i `veus` NO sonen sempre.
- `bateria` i `greus` sonen sempre.

### bateria

Els samples són aleatoris per cada un dels kits: `kick`, `snare` i `hi-hat`.

La bateria té un `delay` global i cada kit té el seu propi `delay` afegit.

Tots aquests delays són modulables amb una sola variable `complexitat del beat` o `cb` determinada per l'usuari.

Els paràmetres originals pel delay de bateria són:
- `delay bateria`: delay global de tota la bateria. 
                random(0, 0.05) + ([-1 | 1] * `cb` / 90)
- `delay kick`: random(0, 0.087) + ([-1 | 1] * `cb` / 30)
- `delay snare`: random(0, 0.076) + ([-1.5 | 1.5] * `cb` / 30)
- `delay hihat`: random((-0.01), (0.05 + (0.005 * `cb`))) -- el codi de sonic-pi diu: `rrand(-0.01,0.05+0.005*cb)`, no sé quin és l'ordre de precedència dels operadors en Sonic-Pi

Els paràmetres originals de mixing per bateria són:
- `volum bateria`: 1.1 
- `volum kick`: general * rand(1.8, 2.0)
- `volum snare`: general * rand(1.8, 2.0)
- `volum snare2`: general * rand(0.0, 0.3)
- `volum hihat`: general * rand(0.2, 0.25)

### aguts i greus

- El `sample` s'agafa aleatoriament de la carpeta `starters`.
- És el mateix arxiu pel sample agut i pel greu.
- La durada i el ritme del `sample` s'han d'adaptar als `bpm`. El pitch pot canviar.
- **chops**: tallar el sample en [8, 16] trossos i triar-ne 8 aleatòriament. Els trossos triats han d'estar relativament a prop en el sample original perquè soni cohesionat.
- Es necessiten 4 grups de `chops` per cada sample (mirar la secció **Estructura** més avall).

***PREGUNTA: la durada dels chops és diferent per cada chop o és un valor igual per tots els chops?***

#### aguts
Els paràmetres pels samples aguts són:

- **on/off**: si sona o no ve determinat per l'usuari
- **rate**: el sample agut va a 2x la velocitat, una octava més agut
- **volum**: volum al que sona el sample agut - 0.7
- **delay**: delay per afegir groove - random(0.02, 0.07) ***PREGUNTA: els temps de delay són en segons, o és en beats?***
- **cutoff HPF**: filtre per separar agut i greu - random(80, 90)/140 ***PREGUNTA: 140 equival a 10 kHz, 15 kHz o 20 kHz?***
- **pan**: espacialització stereo - choose [-0.5 | 0.5] (**OJU! no és random, és un o l'altre**)
- **durada**: quan dura un tall (per beat) - random(0.6, 0.8) - durada del tall ***PREGUNTA: què passa si dura menys que el beat? i si dura més?***

***PREGUNTA: aquests no sé què fan. Si només són efectes, haurien d'anar a l'apartat FX (més avall)***

- **echo mix**: random(0.02, 0.05)
- **echo decay**: random(0.0, 1.0)
- **reverb mix**: random(0.05, 0.35)
- **distància**: `1` . Distància entre cada trig del sample?
- **salt**: no sé què és això


#### greus
Els paràmetres pels samples greus són:

- **volum**: volum al que sona el sample greu - 1.2
- **delay**: delay per afegir groove - random(0.06, 0.12)
- **cutoff LPF**: filtre per separar greus d'aguts (si n'hi ha)
  - 80/140 si sona amb sample agut
  - 100 si sona sol (sense el sample agut)
- **pan**: espacialització stereo - random(-0.09, 0)

***PREGUNTA: no sé què són***

- factor amplitud
- separapadsampelgreu
- fingreu
- inicigreu
- saltsampgreu

### veus

- El sample de veu es tria aleatòriament de la carpeta `veus`.
***PREGUNTA: quant dura? s'ha de processar d'alguna manera?***

## Estructura

- Hi ha dos nivells d'estructura. 
- Al nivell més alt hi ha 2 variants: `A` i `B`.
- S'estructuren en la forma `AAB`.
- Cada variant té una sub-estructura `a` i `b`.
  - `a` i `b` es componen de `2` variants: `a1` i `a2`, `b1` i `b2`.
  - `a` i `b` són grups de `3+1` o de `6+2`. És a dir:
    - `a = [a1, a1, a1, a2]` o `a = [a1, a1, a1, a1, a1, a1, a2, a2]`
    - `b = [b1, b1, b1, b2]` o `b = [b1, b1, b1, b1, b1, b1, b2, b2]`



- Les variants`a1`, `a2`, `b1` i `b2` les componen grups de `8` o `16` beats.

## FX

Tots els tracks tenen efectes, però determinarem els seus paràmetres un cop estigui tot muntat perquè els paràmetres no són iguals entre diferents implementacions, i pot ser que variïn entre llenguatges. Especialment els de reverb i compressor. Els delays, en principi, sí que haurien de funcionar igual.


# Dubtes

- en l'estructura, el sample és el mateix per totes les repeticions i el que canvia és el `chop`, o el sample també és diferent? és el mateix sample amb diferents `chop` per `a1` i `a2`, i un sample diferent per `b1` i `b2`? o és el mateix sample per les 4 variants? o un sample diferent per a cada variant
- els volums són en `dB` o en `amp`?
- qui forma les seqüències de bateria? són predeterminades o hi ha grooves predeterimats i surten d'allà?
- els temps de delay són en segons o beats?
- els cutoffs són sobre 140. No sabem la unitat, però 140 equival a 10 kHz, 15 kHz o 20 kHz?
- no entenem lo de la durada dels chops. Què determina: Quant dura un sol chop? Quant duren cadascun dels chops (tots el mateix valor)? què pasa si la durada és inferior al beat? i si és superior?
- pels efectes, caldria una llista dels que necessites, en quin ordre i per quin "track" o instrument. També cal tenir una llista dels paràmetres que vols poder manipular a cadascun dels efectes. Això ho farem un cop tinguem el sistema muntat perquè no tenen perquè ser els mateixos valors que a Sonic-Pi. Et podem deixar una guia de com tunejar-los. Si és el que vols, si et plau especifíca-ho a la secció **FX**.
- caldria detallar què passa amb les veus.
- especifica què vols poder tunejar un cop t'entreguem el codi. I quina documentació necessites.
