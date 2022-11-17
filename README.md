### Deprecation notice

[@preact/signals](https://github.com/preactjs/signals) or [usignal](https://github.com/WebReflection/usignal) show best in class performance and are recommended instead.

---

# value-ref [![test](https://github.com/spectjs/value-ref/actions/workflows/node.js.yml/badge.svg)](https://github.com/spectjs/value-ref/actions/workflows/node.js.yml) [![npm version](https://img.shields.io/npm/v/value-ref)](http://npmjs.org/value-ref)

> <em>V</em>alue <em>ref</em>erence with reactivity.

#### `ref = v( init? )`

Creates reactive mutable _`ref`_ object with `.value` property holding internal value. <br/>
Exposes minimal [_Observable_](https://github.com/tc39/proposal-observable/issues/210) and _AsyncIterable_ interfaces.

#### `ref = v.from(...sources, map?)`

Create reactive _`ref`_ object mapped from passed reactive sources / observables.

```js
import v from './value-ref.js'

let count = v(0)
count.value // 0

const { unsubscribe } = count.subscribe(value => {
  console.log(value)
  return () => console.log('teardown', value)
})
count.value = 1
// > 1
count.value = 2
// > "teardown" 1
// > 2
unsubscribe()

// create mapped ref
let double = v.from(count, value => value * 2)
double.value // 4
count.value = 3
double.value // 6

// create from multiple refs
let sum = v.from(count, double, (count, double) => count + double)

// async iterable
for await (const value of sum) console.log(value)

// dispose refs (automatically unsubscribes on garbage collection)
count = double = sum = null
```

Note: manual dispose is available as `ref[Symbol.dispose]`, but unnecessary - _FinalizationRegistry_ unsubscribes automatically if reference is lost.

## Related

* [templize](https://github.com/spectjs/templize) − template parts with reactive fields support.
* [hyperf](https://github.com/spectjs/hyperf) − dom fragments builder with reactive fields support.
* [sube](https://github.com/spectjs/sube) − subscribe to any reactive source.
* [subscribable-things](https://github.com/chrisguttandin/subscribable-things) − collection of observables for different browser APIs - perfect match with spect.

## Similar

[observable-value](https://github.com/medikoo/observable-value), [knockout/observable](https://github.com/knockout/tko/issues/22), [mobx/observable](https://mobx.js.org/api.html), [rxjs](https://ghub.io/rxjs), [vue3/ref](https://v3.vuejs.org/api/refs-api.html), [observable](https://ghub.io/observable), [observable proposal](https://github.com/tc39/proposal-observable), [observ](https://ghub.io/observ), [mutant](https://ghub.io/mutant), [iron](https://github.com/ironjs/iron), [icaro](https://ghub.io/icaro), [introspected](https://ghub.io/introspected), [ulive](https://github.com/kethan/ulive), [trkl](https://github.com/jbreckmckye/trkl), [emnudge/trkl](https://github.com/EmNudge/trkl), [usignal](https://github.com/WebReflection/usignal), [preact/signals](https://github.com/preactjs/signals), [cellx](https://ghub.io/cellx).

<p align="center">ॐ</p>
