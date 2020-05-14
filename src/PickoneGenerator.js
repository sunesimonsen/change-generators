const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");
const unwrap = require("./unwrap");

class PickoneGenerator extends Generator {
  constructor(items = []) {
    super("pickone", {
      items
    });

    if (items.length === 0) {
      throw new Error("Pickone require a non-empty array of items");
    }
  }

  shrink(item, context) {
    const lastValue = context.childContext(this).get("lastValue");

    if (lastValue && lastValue.shrink) {
      return lastValue.shrink(item, context);
    } else {
      return new ConstantGenerator(item);
    }
  }

  expand(item, context) {
    const lastValue = context.childContext(this).get("lastValue");
    const expandableItem = lastValue && lastValue.expand;

    return new WeightedGenerator([
      [this, 10],
      [expandableItem ? lastValue.expand(item, context) : item, 15]
    ]);
  }

  generate(chance, context) {
    const { items } = this.options;

    const index = chance.natural({ max: items.length - 1 });
    const value = items[index];

    context.childContext(this).set("lastValue", value);

    return unwrap(value, chance, context);
  }
}

module.exports = PickoneGenerator;
