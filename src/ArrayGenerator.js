const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const ArraySplicerGenerator = require("./ArraySplicerGenerator");
const PicksetGenerator = require("./PicksetGenerator");

class ArrayGenerator extends Generator {
  constructor(itemGenerator, { min = 0, max = 30 } = {}) {
    super("array", {
      itemGenerator,
      min,
      max
    });

    if (!itemGenerator || !itemGenerator.isGenerator) {
      throw new Error(
        "The array generator requires an item generator as first argument"
      );
    }
  }

  shrink(items, context) {
    if (items.length === 0) {
      return new ConstantGenerator([]);
    }

    const itemGenerator = this.options.itemGenerator;
    if (itemGenerator.shrink) {
      items = items.map(item => itemGenerator.shrink(item, context));
    }

    return new ArraySplicerGenerator(items, {
      min: this.options.min
    });
  }

  expand(items, context) {
    const { itemGenerator, min, max } = this.options;

    return new PicksetGenerator([itemGenerator, ...items], {
      min,
      max
    });
  }

  generate(chance, context) {
    const { itemGenerator, min, max } = this.options;

    return chance.n(
      () => itemGenerator.generate(chance, context),
      chance.natural({ min, max })
    );
  }
}

module.exports = ArrayGenerator;
