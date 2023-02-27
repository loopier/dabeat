# Dabeat

## Guia per tunejar

Hi ha variables fixes (constants) i altres que depenen de `seed`, `cb` i `cs`.

### constants

Les constants estan definides com a variables globals.
Les úniques que serien susceptibles de ser canviades són les de la secció encapçalada per `drumkit fixed values`.

### variables

A la funció `update()` hi trobaràs totes les variables per cadascun dels instruments. Estan dividides per objectes amb el nom `[NOM D'INSTRUMENT]Config`. Per exemple, tot el que tingui a veure amb els greus està a `bassConfig`.

Dins del codi hi trobaràs comentaris que diuen què és cada cosa. Com a resum:

- `.name` nom de l'instrument. Podria anar com a constant, però ho hem posat aquí.
- `.filename` **Es posa automàticament**. Nom de l'arxiu d'audio.
- `.filter` tipus de filtre: `"hipass"` o `"lowpass"`.
- `.cutoff` freqüència del filtre en Hz. La fórmula que hi ha és per convertir de les unitats misterioses de Sonic Pi (0-140) a un valor entre 20 Hz i 20 kHz
- `.rate` velocitat de reproducció del sample. `1` és normal. `0` és stop. `2` és el doble de ràpid. Modifica el pitch.
- `·pan` panoramització estèreo. `1` és dreta, `-1` és esquerra, `0` és al mig.
- `.startPositions` **Es calcula automàticament**. Array amb els punts de cadascun dels talls.
- `.startPositionsDelta` **Es calcula automàticament**. Array amb la distància entre cadascun dels punts d'inici dels talls. Cada tall és triat aleatòriament. Com més gran és aquest valor, més lluny dins el sample podrà l'`startPoint` del següent tall. Si el valor és `0`, el següent tall serà contigu (per davant o darrere).
- `.legato` duració de cadascun dels talls. Si el valor és `1`, el tall durarà tot el beat. Si el valor és `<1`, hi haurà un silenci entre talls (com més petit el valor, més llarg el silenci); `0` seria silenci absolut. Si el valor és `>1`, els talls se superposaran.
- `.volume` volum al que sona el sample. `1` és unity gain. `0` és silenci.
- `.play`**No editar**. L'objecte de `Tone` que fa sonar el sample. 
- `.dur` **No editar**. Duració del beat.
- `.pattern` patró rítmic. Es configura amb la constant `*Pattern`. Al codi hi ha comentaris explicant com funciona: valors entre `[0-1]` que indica la probabilitat que soni en aquell beat. `0.5` és un 50% de probabilitats.
- `.delays` **Es calcula automàticament** a martir de les constants `drumkitDelay`, `*Delay` i `*ConstDelay`. Al codi hi ha comentaris per aquestes constants.
