import t, {is, throws} from './node_modules/tst/tst.js'
import { tick, frame, time } from './node_modules/wait-please/index.js'
import v from './value-ref.js'

// value
t('v: readme', async t => {
  let log = []
  let v1 = v(0)

  // get
  is(v1.value, 0)

  // subscribe
  let unsub = v1.subscribe(value => {
    log.push(value)
    return () => log.push('-')
  })

  // set
  v1.value = 1
  is(v1.value, 1)
  is(log, [0, '-', 1])
  unsub()

  // from value
  let v2 = v1.map(v1 => v1 * 2)
  log = []
  v2.subscribe(v2 => log.push(v2))
  is(v2.value, 2) // > 2
  is(v1.value, 1)
  is(log, [2])
  v1.value = 1
  is(log, [2, 2])

  // initialize value
  let v3 = v(v1)
  is(v3.value, v1) // v5

  // dispose
  ;[v3, v2, v1].map(v => v[Symbol.dispose]())
})
t('v: core API', async t => {
  let s = v(0)

  // observer 1
  let log = []
  // ;(async () => { for await (let value of s) log.push(value) })()
  s.subscribe(value => log.push(value))

  is(+s, 0, 'toPrimitive')
  is(s.valueOf(), 0, 'valueOf')
  is(s.toString(), 0, 'toString')

  is(s.value, 0, 's()')

  await tick()
  is(log, [0], 'should publish the initial state')

  s.value = 1
  is(+s, 1, 'state.current = value')

  s.value = 2
  is(+s, 2, 'state(value)')
  is(s.value, 2, 'state(value)')

  s.value += 1
  is(s.value, 3, 'state(state + value)')

  // observer 2
  let log2 = []
  // ;(async () => { for await (let value of s) log2.push(value) })()
  s.subscribe(value => log2.push(value))

  await tick(8)
  is(log.slice(-1), [3], 'should track and notify first tick changes')
  await tick(8)
  is(log2, [3], 'should properly init set')
  s. value = 4
  await tick(8) // why 4 ticks delay?
  is(log.slice(-1), [4], 'arbitrary change 1')
  s. value = 5
  await tick(8)
  is(log.slice(-1), [5], 'arbitrary change 2')

  is(log2.slice(-1), [5], 'secondary observer is fine')
})
t.skip('v: should not expose technical symbols', async t => {
  let s = v({x: 1})
  let log = []
  for(let p in s) {
    log.push(p)
  }
  is(log, [])
})
t('spreading', t => {
  // NOTE: we don't spread array because it may create confusing error accidentally spreading array value
  let s = v(0)
  throws(() => {
    let [x] = s
  })
  // is(x,0)

  let {value} = s
  is(value, 0)
})
t.skip('v: v to v', t => {
  // NOTE: we don't support setter function anymore, use arrow subscriber
  const a = v(0), b = v()
  a.subscribe(b)
  is(a.value, 0)
  is(b.value, 0)
})
t('v: subscribe teardown', t => {
  const a = v()
  const log = []
  a.subscribe(value => {
    log.push('in', value)
    return () => log.push('out', value)
  })
  is(log, [])
  a.value = 0
  is(log, ['in', 0])
  a.value = 1
  is(log, ['in', 0, 'out', 0, 'in', 1])
})
t('v: multiple subscriptions should not inter-trigger', async t => {
  let value = v(0)
  let log1 = [], log2 = [], log3 = []
  value.subscribe(v => log1.push(v))
  value.subscribe(v => log2.push(v))
  is(log1, [0])
  is(log2, [0])
  value.value = 1
  is(log1, [0, 1])
  is(log2, [0, 1])
  value.subscribe(v => log3.push(v))
  is(log1, [0, 1])
  is(log2, [0, 1])
  is(log3, [1])
  value.value = 2
  is(log1, [0, 1, 2])
  is(log2, [0, 1, 2])
  is(log3, [1, 2])
})
t('v: stores arrays with observables', async t => {
  let a = v([])
  is(a.value, [])
  a.value = [1]
  is(a.value, [1])
  a.value = [1, 2]
  is(a.value, [1, 2])
  a.value = []
  is(a.value, [])

  let b = v(0)
  a = v([b])
  is(a.value, [b])
  b.value = 1
  is(a.value, [b])
  a.value = [b.value]
  is(a.value, [1])
})
t.skip('v: stringify', async t => {
  // TODO: can't fix :()
  let v1 = v(1), v2 = v({x:1})
  is(JSON.stringify(v1), '1')
  is(JSON.stringify(v2), `{"x":1}`)
})
t.skip('v: multiple values', async t => {
  // NOTE: we don't support multiple values due to simple nature of ref
  // create and bind composed values manually
  let x = v()
  let log = []
  x.subscribe((a,b,c) => log.push(a,b,c))
  is(log, [])
  x(1,2,3)
  is(log, [1,2,3])
  is(x(), [1,2,3])

  let y = x.map((a,b,c) => log.push(a,b,c))
  is(log, [1,2,3,1,2,3])
})
// Observable methods
t('v: o.map', async t => {
  let v1 = v(1), v2 = v1.map(x => x + 1)
  is(v2.value, 2)
  v1.value = 2
  is(v2.value, 3)
})
t.skip('v: init from observable', t => {
  // NOTE: we don't init from anything. Use strui/from
  let v1 = v(1), v2 = v(v1)
  is(v2(), 1)
  v1.value = 2
  is(v2(), 2)
})
t.skip('v: init from mixed args', t => {
  // NOTE: we don't init from anything. Use strui/from
  let v1 = v(1), v2 = v(1, v1)
  is(v2(), [1, 1])
  v1.value = 2
  is(v2(), [1, 2])
})
t('v: expose current value by index', t => {
  // NOTE: we don't support multiple values, but exposing by index is good idea
  let a = v(0,1,2)
  is(a[0], 0)
  // is(a[1], 1)
  // is(a[2], 2)
  // a(1,2,3)
  a.value = 1
  is(a[0], 1)
  // is(a[1], 2)
  // is(a[2], 3)
})

// error
t.skip('v: error in mapper', async t => {
  // NOTE: actually mb useful to have blocking error in mapper
  let x = v(1)
  let y = x.map(x => {throw Error('123')})
  t.ok(y.error)
})
t.skip('v: error in subscription', async t => {
  let x = v(1)
  x.subscribe(() => {throw new Error('x')})
})
t.skip('v: error in init', async t => {
  let x = v(() => {throw Error(123)})
})
t.skip('v: error in set', async t => {
  let x = v(1)
  x(x => {throw Error(123)})
})
