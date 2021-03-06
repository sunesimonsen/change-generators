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

  shrink(item) {
    if (this.lastUnwrappedValue === item && this.lastValue.shrink) {
      return this.lastValue.shrink(item);
    } else {
      return new ConstantGenerator(item);
    }
  }

  expand(item) {
    const isGeneratorItem = this.lastValue && this.lastValue.isGenerator;

    const expandableItem =
      this.lastUnwrappedValue === item &&
      isGeneratorItem &&
      this.lastValue.expand;

    const expandedItem = expandableItem ? this.lastValue.expand(item) : item;

    const maxWeight = this.options.reduce(
      (result, [item, weight]) => Math.max(result, weight),
      -Infinity
    );

    const filteredOptions = expandableItem
      ? this.options
      : this.options.filter(
          ([optionItem]) => optionItem !== item && optionItem !== this.lastValue
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

    this.lastValue = chance.weighted(items, weights);
    this.lastUnwrappedValue = unwrap(this.lastValue, chance, context);

    return this.lastUnwrappedValue;
  }
}

module.exports = WeightedGenerator;
