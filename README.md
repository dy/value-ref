# vref

> Observable value reference.

#### `const ref = v( init? )`

Creates reactive mutable _`ref`_ object with a single `.value` property holding internal value. Ex `spect/v.js`. <br/>
Identical to [vue3 ref](https://v3.vuejs.org/api/refs-api.html#ref) with _Observable_ and _AsyncIterable_ interface.

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

## References

* [vue3/ref](https://v3.vuejs.org/api/refs-api.html)
* [knockout/observable](https://github.com/knockout/tko/issues/22)
* [mobx/observable](https://mobx.js.org/api.html)
* [rxjs](https://ghub.io/rxjs)
* [observable](https://ghub.io/observable)
* [observable proposal](https://github.com/tc39/proposal-observable)
* [observ](https://ghub.io/observ)
* [mutant](https://ghub.io/mutant)
* [iron](https://github.com/ironjs/iron)
* [icaro](https://ghub.io/icaro)
* [introspected](https://ghub.io/introspected)
* [unihooks](https://ghub.io/unihooks)
* [augmentor](https://ghub.io/augmentor) and others.

<p align="center">ॐ</p>
