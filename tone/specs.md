# Especificacions

07.11.2022

## User interface

Variables que pot modificar l'usuari:

- random global: randomitzar tot
- complexitat del beat: [0-5] ????
- complexitat del sample: tria si sona només el sample greu, o l'agut i el greu
- número de sample

Els valors aleatoris són pseudo-random, i s'alimenten amb un `seed`. 

Si es posa el mateix `seed` el resultat ha de ser el mateix.

## Arxius

Els arxius d'audio son en format `.wav`. N'hi ha de llargs i de curts.
Els samples curts són sons de bateria (drumkit) i s'organitzen amb l'estructura:

- `snares`, `snaps`, `claps`
- `kicks`
- `hats`

Els samples llargs són agafats de temes existents:

- `starters`: samples curats perquè sonin bé
- `startersDef`: samples sense curar
- `veus`: samples de veu

## Implementació

### tempo
El tempo ha de ser aleatori: **[86-98] bpm**

### 

Poden sonar fins a 4 "tracks": `drums`, `aguts`, `greus`, i `veus`.

### drums

TODO

### aguts i greus

- El `sample` s'agafa aleatoriament de la carpeta `starters`.
- La duració i el ritme del `sample` s'han d'adaptar als `bpm`. El pitch pot canviar.
- **chops**: tallar el sample en [8, 16] trossos i triar-ne 8 aleatòriament. Els trossos triats han d'estar relativament a prop en el sample original perquè soni cohesionat.

#### aguts
- **on/off**: si sona o no ve determinat per l'usuari
- **delay**: random [0.02-0.07]
- **cutoff HPF**: random [80-90]/140 ***PREGUNTA: 140 equival a 10 kHz, 15 kHz o 20 kHz?***
- **panagut**: choose [-0.5, 0.5] (**OJU! no és random, és un o l'altre**)
- **duració**: random [0.6-0.8] - duració del tall

***PREGUNTA: aquests no sé què fan***

- **echo mix**: random [0.02-0.05]
- **echo decay**: random [0.0-1.0]
- **reverb mix agut**: random [0.05-0.35]
- **distància**: `1` . Distància entre cada trig del sample?


#### greus

TODO

### veus

- El sample de veu es tria aleatòriament de la carpeta `veus`.
