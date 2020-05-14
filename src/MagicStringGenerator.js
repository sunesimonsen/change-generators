const Generator = require("./Generator");
const WeightedGenerator = require("./WeightedGenerator");
const { getMagicStrings } = require("./magicValues");

class MagicStringGenerator extends Generator {
  constructor(arg) {
    super("magicString");
  }

  expand(generated, context) {
    return new WeightedGenerator([[this, 1], [generated, 1.5]]);
  }

  generate(chance) {
    const magicStrings = getMagicStrings();

    if (magicStrings.length > 0) {
      return chance.pickone(magicStrings);
    } else {
      return chance.string({ length: chance.natural({ min: 0, max: 30 }) });
    }
  }
}

module.exports = MagicStringGenerator;
