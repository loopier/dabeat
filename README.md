# Dabeat

# resum reunió
## estructura
- A A B
- A = 3+1 || 6+2
- B = 3+1 || 6+2

## loop bd, sn, hh

- delays determinats a l'INIT
- delay per track + delay global
- probabilitats en alguns beats: `one_in(x)`

## samples
- chop(n) UN SOL SAMPLE
- rate: beat_stretch proporcional a la durada del sample
- ratio: rate transposat a tò (nota de l'escala)
- cutoff: separació entre sample agut i greu
- choose 2 seqüències de slices:
  1. slices per agut:
     - beat_stretch = (rate + ratio) * 2
     - HPF(cutoff)

  2. slices per greu
     - rate + ratio
     - LPF(cutoff + (a|b):
       a. si acompanya a agut: cutoff = cutoff(agut)
       b. si només sona el greu: cutoff + un extra per ocupar més espectre agut


# meta code

1. load a sample
2. choose chunks favouring those that are closer to each other
3. create 8 sequences of chunks with step #2:
   - 2 sequences for low-end part A:
     ```
     bass.A1 = chunks.scramble(N);
     bass.A2 = chunks.scramble(N);
     ```
   - 2 sequences for low-end part B: `...`
   - 2 sequences for high-end part A: `...`
   - 2 sequences for high-end part B: `...`
4. create phrases:
   - bassA: `[A1.pseq(3), A2.pseq(1)]`
   - bassB: `[B1.pseq(3), B2.pseq(1)]`
   - altoA: `[A1.pseq(3), A2.pseq(1)]`
   - altoB: `[B1.pseq(3), B2.pseq(1)]`
5. create master sequence:
   - bass: `[A,A,B].pseq`
   - alto: `[A,A,B].pseq`
6. EQ: set `cutoff` according to the parts playing
   - HPF + LPF if both alto and bass are playing
   - LPF + offset if only bass is playing
7. remix both bass and alto
