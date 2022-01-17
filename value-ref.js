export default init => new Ref(init)

const NEXT=0, ERROR=1, COMPLETE=2, UNSUB=3, TEARDOWN=4

const unsubscribe = obs => obs?.map?.(sub => sub[UNSUB]()),
      registry = new FinalizationRegistry(unsubscribe)

class Ref {
  #observers=[]

  // NOTE: on finalization strategy
  // we unsubscribe only by losing source, not by losing subscriptions
  // safe is to let event handlers sit there as far as source is available
  // it can generate events, dereferencing listeners would be incorrect
  constructor(init){ this[0] = init, registry.register(this, this.#observers) }

  get value() { return this[0] }
  set value(val) {
    this[0] = val
    for (let sub of this.#observers)
      (sub[TEARDOWN]?.call?.(), sub[TEARDOWN] = sub[NEXT](val))
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
        next,
        error,
        complete,
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

  error(e) {this.#observers.map(sub => sub[ERROR]?.(e))}

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
