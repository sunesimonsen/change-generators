const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");

const MAX_INT = Number.MAX_SAFE_INTEGER || 9007199254740991;

class FloatingGenerator extends Generator {
  constructor({
    name = "floating",
    fixed = 4,
    min = -(MAX_INT / Math.pow(10, fixed)),
    max = MAX_INT / Math.pow(10, fixed)
  } = {}) {
    super(name, {
      min,
      max,
      fixed
    });
  }

  shrink(value) {
    if (value < 0 && value < this.options.max) {
      return new FloatingGenerator({
        min: value,
        max: Math.min(0, this.options.max)
      });
    } else if (value > 0 && value > this.options.min) {
      return new FloatingGenerator({
        min: Math.max(0, this.options.min),
        max: value
      });
    } else {
      return new ConstantGenerator(value);
    }
  }

  expand(value, context) {
    return new WeightedGenerator([
      [new ConstantGenerator(value), 2],
      [
        new FloatingGenerator({
          min: Math.max(value - 100, this.options.min),
          max: Math.min(value + 100, this.options.max)
        }),
        1
      ],
      [this, 2]
    ]);
  }

  generate(chance) {
    return chance.floating(this.options);
  }
}

module.exports = FloatingGenerator;
