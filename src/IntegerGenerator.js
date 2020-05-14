const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");

class IntegerGenerator extends Generator {
  constructor({
    name = "integer",
    min = Number.MIN_SAFE_INTEGER || -9007199254740991,
    max = Number.MAX_SAFE_INTEGER || 9007199254740991
  } = {}) {
    super(name, {
      min,
      max
    });
  }

  shrink(value) {
    if (value < 0 && value < this.options.max) {
      return new IntegerGenerator({
        min: value,
        max: Math.min(0, this.options.max)
      });
    } else if (value > 0 && value > this.options.min) {
      return new IntegerGenerator({
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
        new IntegerGenerator({
          min: Math.max(value - 100, this.options.min),
          max: Math.min(value + 100, this.options.max)
        }),
        1
      ],
      [this, 2]
    ]);
  }

  generate(chance) {
    return chance.integer(this.options);
  }
}

module.exports = IntegerGenerator;
