export default init => new Ref(init)

const NEXT=0, ERROR=1, COMPLETE=2, UNSUB=3, TEARDOWN=4

const unsubscribe = obs => obs?.map?.(sub => sub[UNSUB]()),
      registry = new FinalizationRegistry(unsubscribe)

class Ref {
  #observers=[]

  constructor(init){ this[0] = init, registry.register(this, this.#observers) }

  get value() { return this[0] }
  set value(val) {
    this[0] = val
    for (let sub of this.#observers)
      !(sub[NEXT]||sub[ERROR]||sub[COMPLETE]).deref() ? sub[UNSUB]() : // unsubscribe is ref is lost
        (sub[TEARDOWN]?.call?.(), sub[TEARDOWN] = sub[NEXT].deref()?.(val))
  }

  valueOf() {return this.value}
  toString() {return this.value}
  [Symbol.toPrimitive](hint) {return this.value}

  subscribe(next, error, complete) {
    next = next?.next || next
    error = next?.error || error
    complete = next?.complete || complete

    const observers = this.#observers,
      unsubscribe = () => (
        subscription[TEARDOWN]?.call?.(),
        observers.splice(observers.indexOf(subscription) >>> 0, 1)
      ),
      subscription = [
        next && new WeakRef(next), // weakrefs automatically unsubscribe targets
        error && new WeakRef(error),
        complete && new WeakRef(complete),
        unsubscribe,
        this[0] !== undefined ? next(this[0]) : null // teardown
      ]

    observers.push(subscription)

    return unsubscribe.unsubscribe = unsubscribe
  }

  map(mapper) {
    const ref = new Ref()
    this.subscribe(v => ref.value = mapper(v))
    return ref
  }

  error(e) {this.#observers.map(sub => sub[ERROR]?.deref()?.(e))}

  [Symbol.observable||=Symbol.for('observable')](){return this}

  async *[Symbol.asyncIterator]() {
    let resolve, buf = [], p = new Promise(r => resolve = r),
      unsub = this.subscribe(v => ( buf.push(v), resolve(), p = new Promise(r => resolve = r) ))
    try { while (1) yield* buf.splice(0), await p }
    catch {}
    unsub()
  }

  [Symbol.dispose||=Symbol('dispose')]() {
    unsubscribe(this.#observers)
    delete this[0]
    this.#observers = null
  }
}
