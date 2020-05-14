const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");

class StringSplicerGenerator extends Generator {
  constructor(text, { min = 0 } = {}) {
    super("stringSplicer", {
      text,
      min
    });

    if (typeof text !== "string") {
      throw new Error(
        "The string splicer generator requires a string as first argument"
      );
    }
  }

  shrink(text) {
    const { min } = this.options;

    if (text.length === min) {
      return new ConstantGenerator(text);
    }

    return new StringSplicerGenerator(text, { min });
  }

  expand(text, context) {
    return new WeightedGenerator([
      [this, 1],
      [new ConstantGenerator(text), 1.5]
    ]);
  }

  generate(chance) {
    const { min, text } = this.options;
    const from = chance.natural({ max: text.length });
    const length = chance.natural({
      max: Math.min(text.length - from, text.length - min)
    });
    return text.slice(0, from) + text.slice(from + length);
  }
}

module.exports = StringSplicerGenerator;
