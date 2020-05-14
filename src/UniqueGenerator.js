const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const ArraySplicerGenerator = require("./ArraySplicerGenerator");
const WeightedGenerator = require("./WeightedGenerator");

class UniqueGenerator extends Generator {
  constructor(itemGenerator, { min = 0, max = 20, comparator } = {}) {
    super("array", {
      itemGenerator,
      min,
      max,
      comparator
    });

    if (!itemGenerator || !itemGenerator.isGenerator) {
      throw new Error(
        "The unique generator requires an item generator as first argument"
      );
    }
  }

  shrink(items) {
    if (items.length === 0) {
      return new ConstantGenerator([]);
    }

    return new ArraySplicerGenerator(items, {
      min: this.options.min
    });
  }

  expand(items, context) {
    return new WeightedGenerator([
      [this, 1],
      [new ConstantGenerator(items), 1.5]
    ]);
  }

  generate(chance, context) {
    const { itemGenerator, min, max, comparator } = this.options;

    return chance.unique(
      () => itemGenerator.generate(chance, context),
      chance.natural({ min, max }),
      comparator && { comparator }
    );
  }
}

module.exports = UniqueGenerator;
