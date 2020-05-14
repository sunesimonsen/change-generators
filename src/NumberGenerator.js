const Generator = require("./Generator");
const IntegerGenerator = require("./IntegerGenerator");
const FloatingGenerator = require("./FloatingGenerator");
const MagicFloatingGenerator = require("./MagicFloatingGenerator");
const MagicIntegerGenerator = require("./MagicIntegerGenerator");
const WeightedGenerator = require("./WeightedGenerator");
const PickoneGenerator = require("./PickoneGenerator");

class NumberGenerator extends Generator {
  constructor({
    integer = true,
    floating = true,
    infinity = false,
    nan = false
  } = {}) {
    const options = {};
    const generators = [];

    const hasInstrumentation =
      typeof global === "object" && Boolean(global.recordLocation);

    if (floating) {
      options.floating = true;
      generators.push([new FloatingGenerator({ min: -100, max: 100 }), 30]);
      generators.push([new FloatingGenerator({ min: -10000, max: 10000 }), 20]);
      generators.push([new FloatingGenerator(), 5]);

      if (hasInstrumentation) {
        generators.push([new MagicFloatingGenerator(), 5]);
      }
    }

    if (integer) {
      options.integer = true;
      generators.push([new IntegerGenerator({ min: -100, max: 100 }), 30]);
      generators.push([new IntegerGenerator({ min: -10000, max: 10000 }), 20]);
      generators.push([new IntegerGenerator(), 5]);
      generators.push([new PickoneGenerator([-0, +0]), 0.1]);

      if (hasInstrumentation) {
        generators.push([new MagicIntegerGenerator(), 5]);
        generators.push([new MagicIntegerGenerator().map(v => v + 1), 5]);
        generators.push([new MagicIntegerGenerator().map(v => v - 1), 5]);
      }
    }

    if (infinity) {
      options.infinity = true;
      generators.push([new PickoneGenerator([Infinity, -Infinity]), 0.5]);
    }

    if (nan) {
      options.nan = true;
      generators.push([NaN, 0.1]);
    }

    super("number", options);

    if (Object.keys(options).length === 0) {
      throw new Error(
        "You must include at least one of the options for the number generator: integer, floating, infinity, nan"
      );
    }

    this.composedGenerator = new WeightedGenerator(generators);
  }

  shrink(number, context) {
    return this.composedGenerator.shrink(number, context);
  }

  expand(number, context) {
    return this.composedGenerator.expand(number, context);
  }

  generate(chance, context) {
    return this.composedGenerator.generate(chance, context);
  }
}

module.exports = NumberGenerator;
