# plan

* [x] ref.from(a, b, c, map?)

* [x] should we autotrack object/array?
  + avoid item.value = item.value
  - creates slow proxy
  ? alternatively: expose object props/methods?
  - nope. Usually it means value is mutated, instead of rewritten. So it serves good purpose.

* [x] remove .map method?
  + that's not defined by standard
  + that's confusing with array signature - from code it's hard to guess
  + subscribable-things and others define it via `map` operator - mb we should conform?
  + that's limited anyways: we may better need calc to be able to compose multiple values, map single value etc?
  ? alternatively: ref.from(inst, map?)
    * or even simpler: ref(inst, map?)
    + .from specially handles argument, whereas direct argument is taken as-is
    + .from can take combined arguments

* [x] make use of weakref?
  * [x] find out a way to test that
  * [x] don't collect by event: it's fine for event to hang there as far as source is available - source can generate more events.

* [x] name: value-ref
  * vref
    + value ref
    + vue ref
    + virtual ref
    - too short up to author weirdness
  * value-ref
    + clearer meaning
    + weak-ref analogy
    + .value property
    + still reminds vue-ref
