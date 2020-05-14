# Iterator

The iterator that is returned when calling `values` on a [generator](../generator/).

Here we will use the [integer](../integer/) generator as an example:

```js#evaluate:false
const { integer } = require("chance-generators")
```

## API

### isExpandable

Is true if the iterator can be expanded.

### isShrinkable

Is true if the iterator can be shrunken.

### next()

Produces a new value based on the [generator](../generator/) that this iterator
was created from.

```js
const integerIterator = integer.values();

expect(
  [integerIterator.next(), integerIterator.next(), integerIterator.next()],
  "to equal",
  [-2260084377780223, 5342043492581377, 8119347222413313]
);
```

### take(n)

Produces `n` items with the generator and return them as an array:

```js
expect(integerIterator.take(3), "to equal", [
  -5702731889115135,
  4179231256870913,
  5038465087438849
]);
```

### shrink()

Returns a new generator that is shunken around the last generated value while
still honoring the constraints of the original generator.

```js
const smallIntegersIterator = integer({ min: -10000, max: 10000 }).values();

expect(smallIntegersIterator.next(), "to equal", -2509);

smallIntegersIterator.shrink();
```

This will shrink the iterator to produce values between `0` and `-2509`.

```js
expect(smallIntegersIterator.take(5), "to equal", [
  -510,
  -123,
  -2049,
  -672,
  -552
]);
```

If we shrink the iterator again, it will produce values been `0` and `-552`.

```js
smallIntegersIterator.shrink();

expect(smallIntegersIterator.take(5), "to equal", [
  -221,
  -222,
  -466,
  -306,
  -466
]);
```

The idea is that every time you find interesting input, you can try to search
for a smaller input by shrinking the iterator.

### expand()

Expands the current generator around the last generated value while still
honoring the constraints of the original generator.

You can use this method when a generator produces an interesting input and you
want to search around that value.

```js
const positiveIterator = natural({ min: 1, max: 1000 }).values();

expect(positiveIterator.next(), "to equal", 375);

positiveIterator.expand();

expect(positiveIterator.take(10), "to equal", [
  951,
  375,
  780,
  394,
  375,
  306,
  375,
  375,
  449,
  375
]);
```

As you can see the expanded iterator will produce values around `375` as that is
our expansion value.
