const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const unwrap = require("./unwrap");

class WeightedGenerator extends Generator {
  constructor(options = []) {
    super("weighted", options);

    if (options.length === 0) {
      throw new Error(
        "Weighted require a non-empty array of items with weights"
      );
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
    const expandedItem = expandableItem
      ? lastValue.expand(item, context)
      : item;

    const maxWeight = this.options.reduce(
      (result, [item, weight]) => Math.max(result, weight),
      -Infinity
    );

    const filteredOptions = expandableItem
      ? this.options
      : this.options.filter(
          ([optionItem]) => optionItem !== item && optionItem !== lastValue
        );

    return new WeightedGenerator([
      ...filteredOptions.slice(0, 20),
      [expandedItem, maxWeight * 1.5]
    ]);
  }

  generate(chance, context) {
    const items = [];
    const weights = [];

    this.options.forEach(([item, weight]) => {
      items.push(item);
      weights.push(weight);
    });

    const value = chance.weighted(items, weights);

    context.childContext(this).set("lastValue", value);

    return unwrap(value, chance, context);
  }
}

module.exports = WeightedGenerator;
