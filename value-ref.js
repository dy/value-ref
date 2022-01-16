// FIXME: can that be made a weakref?
export default init => new Ref(init)

const NEXT=0, ERROR=1, COMPLETE=2, UNSUB=3, TEARDOWN=4

class Ref {
  #observers=[]

  constructor(init){ this[0] = init }

  get value() { return this[0] }
  set value(val) {
    this[0] = val
    for (let sub of this.#observers) {
      sub[TEARDOWN]?.call?.()
      sub[TEARDOWN] = sub[NEXT]?.(val)
    }
  }

  valueOf() {return this.value}
  toString() {return this.value}
  [Symbol.toPrimitive](hint) {return this.value}

  // FIXME: replace with 0b?
  subscribe(next, error, complete) {
    next = next?.next || next
    error = next?.error || error
    complete = next?.complete || complete

    const unsubscribe = () => (
        this.#observers.length && this.#observers.splice(this.#observers.indexOf(subscription) >>> 0, 1),
        complete?.()
      ),
      subscription = [ next, error, complete, unsubscribe ]

    this.#observers.push(subscription)

    if ( this[0] !== undefined ) subscription[TEARDOWN] = next(this[0])

    return unsubscribe.unsubscribe = unsubscribe
  }

  map(mapper) {
    const ref = new Ref()
    this.subscribe(v => ref.value = mapper(v))
    return ref
  }

  error(e) {this.#observers.map(sub => sub[ERROR]?.(e))}

  [Symbol.observable||=Symbol.for('observable')](){return this}

  async *[Symbol.asyncIterator]() {
    let resolve, buf = [], p = new Promise(r => resolve = r),
      unsub = this.subscribe(v => ( buf.push(v), resolve(), p = new Promise(r => resolve = r) ))
    try { while (1) yield* buf.splice(0), await p }
    catch {}
    unsub()
  }

  dispose() {
    this[0] = null
    const unsubs = this.#observers.map(sub => (sub[TEARDOWN]?.call?.(), sub[UNSUB]))
    this.#observers.length = 0
    unsubs.map(unsub => unsub())
  }
  [Symbol.dispose||=Symbol('dispose')]() { return this.dispose() }
}
