const Generator = require("./Generator");
const unwrap = require("./unwrap");

class MappingGenerator extends Generator {
  constructor(generator, mapper) {
    super("map", { mapper });
    this.isMappedGenerator = true;
    this.parentGenerator = generator;

    if (generator.shrink) {
      this.shrink = (value, context) => {
        const lastValue = context.childContext(this).get("lastValue");

        return generator.shrink(lastValue, context).map(mapper);
      };
    }

    if (generator.expand) {
      this.expand = (value, context) => {
        const lastValue = context.childContext(this).get("lastValue");

        return generator.expand(lastValue, context).map(mapper);
      };
    }
  }

  generate(chance, context) {
    const value = this.parentGenerator.generate(chance, context);

    context.childContext(this).set("lastValue", value);

    const { mapper } = this.options;

    return unwrap(mapper(value, chance), chance, context);
  }
}

module.exports = MappingGenerator;
