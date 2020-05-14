const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");

class ShuffleGenerator extends Generator {
  constructor(items = []) {
    super("shuffle", {
      items
    });

    if (items.length === 0) {
      throw new Error("Shuffle require a non-empty array of items");
    }
  }

  shrink(items, context) {
    const lastValue = context.childContext(this).get("lastValue");
    const shrinkable = (lastValue || []).some(g => g && g.shrink);

    if (shrinkable) {
      return new ShuffleGenerator(
        lastValue.map(
          (g, i) => (g && g.shrink ? g.shrink(items[i], context) : items[i])
        )
      );
    } else {
      return new ConstantGenerator(items);
    }
  }

  expand(items, context) {
    return new WeightedGenerator([
      [this, 1],
      [new ConstantGenerator(items), 1.5]
    ]);
  }

  generate(chance, context) {
    const { items } = this.options;

    const value = chance.shuffle(items);

    context.childContext(this).set("lastValue", value);

    return value.map(
      item => (item && item.isGenerator ? item.generate(chance, context) : item)
    );
  }
}

module.exports = ShuffleGenerator;
