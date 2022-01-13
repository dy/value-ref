# vref [![test](https://github.com/spectjs/vref/actions/workflows/node.js.yml/badge.svg)](https://github.com/spectjs/vref/actions/workflows/node.js.yml) [![npm version](https://img.shields.io/npm/v/vref)](http://npmjs.org/vref)

> <em>V</em>alue <em>ref</em>erence with reactivity.

#### `const ref = v( init? )`

Creates reactive mutable _`ref`_ object with a single `.value` property holding internal value. Ex `spect/v.js`. <br/>
Akin to [vue3 ref](https://v3.vuejs.org/api/refs-api.html#ref) with _Observable_ and _AsyncIterable_ interface.

```js
import v from './vref.js'

let count = v(0)
count.value // 0

count.subscribe(value => {
  console.log(value)
  return () => console.log('teardown', value)
})
count.value = 1
// > 1
count.value = 2
// > "teardown" 1
// > 2

let double = count.map(value => value * 2) // create mapped ref
double.value // 4

count.value = 3
double.value // 6

let sum = v(count.value + double.value)
count.subscribe(v => sum.value = v + double.value)
double.subscribe(v => sum.value = count.value + v)

// async iterable
for await (const value of sum) console.log(value)

sum.dispose() // destroy observations
```

## Related

* [subscribable-things](https://github.com/chrisguttandin/subscribable-things) − collection of observables for different browser APIs - perfect match with spect.

## Similar

[vue3/ref](https://v3.vuejs.org/api/refs-api.html), [knockout/observable](https://github.com/knockout/tko/issues/22), [mobx/observable](https://mobx.js.org/api.html), [rxjs](https://ghub.io/rxjs), [observable](https://ghub.io/observable), [observable proposal](https://github.com/tc39/proposal-observable), [observ](https://ghub.io/observ), [mutant](https://ghub.io/mutant), [iron](https://github.com/ironjs/iron), [icaro](https://ghub.io/icaro), [introspected](https://ghub.io/introspected).

<p align="center">ॐ</p>
