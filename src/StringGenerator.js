const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const StringSplicerGenerator = require("./StringSplicerGenerator");

class StringGenerator extends Generator {
  constructor({ min = 0, max = 30, pool } = {}) {
    const options = { min, max };
    if (pool) {
      options.pool = pool;
    }

    super("string", options);
  }

  shrink(text) {
    if (text.length === 0) {
      return new ConstantGenerator("");
    }

    return new StringSplicerGenerator(text, { min: this.options.min });
  }

  expand(data, context) {
    return this.map((text, chance) => {
      const margin = Math.max(
        Math.min(
          Math.floor((text.length - data.length) / 2),
          Math.ceil(data.length * 0.3)
        ),
        0
      );

      const includeLeftMargin = chance.bool({ likelihood: 70 });
      const includeRightMargin = chance.bool({ likelihood: 70 });

      const marginLength =
        (includeLeftMargin ? margin : 0) + (includeRightMargin ? margin : 0);

      const result = new Array(marginLength + data.length);

      let i = 0;
      if (includeLeftMargin) {
        while (i < margin) {
          result[i] = text[i++];
        }
      }

      for (let j = 0; j < data.length; i++, j++) {
        result[i] = chance.bool({ likelihood: 95 })
          ? data[j]
          : text[i % text.length];
      }

      if (includeRightMargin) {
        while (i < result.length) {
          result[i] = text[i++];
        }
      }

      return result.join("");
    });
  }

  generate(chance) {
    const { min, max, pool } = this.options;
    return chance.string({ length: chance.natural({ min, max }), pool });
  }
}

module.exports = StringGenerator;
