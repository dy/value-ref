import sube, {observable} from 'sube'

const ref = (...init) => new Ref(...init)

const NEXT=0, ERROR=1, COMPLETE=2, UNSUB=3, TEARDOWN=4

const unsubscribe = obs => obs?.map?.(sub => sub[UNSUB]()),
      registry = new FinalizationRegistry(unsubscribe)

class Ref extends Array {
  #observers=[]

  // NOTE: on finalization strategy
  // we unsubscribe only by losing source, not by losing subscriptions
  // safe is to let event handlers sit there as far as source is available
  // it can generate events, dereferencing listeners would be incorrect
  constructor(...args) {
    super()
    args.length && this.push(...args)
    registry.register(this, this.#observers)
  }

  get value() { return this[0] }
  set value(val) { this[0] = val, this.set(...this)}

  set(...values) {
    Object.assign(this, values)
    for (let sub of this.#observers)
      (sub[TEARDOWN]?.call?.(), sub[TEARDOWN] = sub[NEXT](...this))
  }

  valueOf() {return this.value}
  toString() {return this.value}
  toJSON() {return this.value}
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
        this.length ? next(...this) : null // teardown
      ]

    observers.push(subscription)

    return unsubscribe.unsubscribe = unsubscribe
  }

  // FIXME: it never gets called
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
    this.length = 0
    this.#observers = null
  }
}

// create new ref from [possibly multiple] sources
Ref.from = ref.from = (...args) => {
  let map, values, ref
  if (args[args.length-1]?.call) map = args.pop()

  values = []
  args.map(
    (arg,i) => observable(arg) ?
      sube(arg, v => (values[i]=v, ref && (map ? ref.value=map(...values) : ref.set(...values)))) :
      (values[i] = arg)
  )

  return ref = map ? new Ref(map(...values)) : new Ref(...values)
}

export default ref
