const Generator = require("./Generator");
const WeightedGenerator = require("./WeightedGenerator");
const { getMagicIntegers } = require("./magicValues");

class MagicIntegerGenerator extends Generator {
  constructor(arg) {
    super("magicInteger");
  }

  expand(generated, context) {
    return new WeightedGenerator([[this, 1], [generated, 1.5]]);
  }

  generate(chance) {
    const magicIntegers = getMagicIntegers();

    if (magicIntegers.length > 0) {
      return chance.pickone(magicIntegers);
    } else {
      return chance.integer();
    }
  }
}

module.exports = MagicIntegerGenerator;
