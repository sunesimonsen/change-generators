const Generator = require("./Generator");
const WeightedGenerator = require("./WeightedGenerator");
const { getMagicFloating } = require("./magicValues");

class MagicFloatingGenerator extends Generator {
  constructor(arg) {
    super("magicFloating");
  }

  expand(generated, context) {
    return new WeightedGenerator([[this, 1], [generated, 1.5]]);
  }

  generate(chance) {
    const magicFloating = getMagicFloating();

    if (magicFloating.length > 0) {
      return chance.pickone(magicFloating);
    } else {
      return chance.floating();
    }
  }
}

module.exports = MagicFloatingGenerator;
