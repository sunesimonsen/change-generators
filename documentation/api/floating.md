# Floating point generator

Random floating point number [generator](../generator/).

```js#evaluate:false
const { floating } = require("chance-generators")
```

Without any arguments it generates random floating point number with at most 4
digits.

```js
expect(floating.take(5), "to equal", [
  -226008437778.0223,
  534204349258.1377,
  811934722241.3313,
  -570273188911.5135,
  417923125687.0913
]);
```

You can constrain the limits of generated numbers by given it `min` and `max`.

Notice both limits are inclusive.

```js
const age = floating({ min: 0, max: 122 });

expect(age.take(5), "to equal", [45.6939, 97.1783, 115.9872, 22.379, 89.3033]);
```

You don't have to specify all the options. The default will be used for the
options you don't specify:

```js
const positive = floating({ min: 0 });

expect(positive.take(5), "to equal", [
  337355743848.0384,
  717462137366.1184,
  856327323857.7152,
  165223368281.2928,
  659321525580.5952
]);
```

You can control the maximum number of digits generated by providing a `fixed` option:

```js
expect(floating({ fixed: 2, min: 0, max: 100 }).take(5), "to equal", [
  37.45,
  79.66,
  95.08,
  18.34,
  73.2
]);
```
