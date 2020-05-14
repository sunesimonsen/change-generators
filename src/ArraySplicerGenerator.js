const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");

class ArraySplicerGenerator extends Generator {
  constructor(items, { min = 0 } = {}) {
    super("arraySplicer", {
      items,
      min
    });
  }

  shrink(items, context) {
    if (items.length === 0) {
      return new ConstantGenerator([]);
    }

    const lastValue = context.childContext(this).get("lastValue");

    const shrinkableData =
      items.length < 10 && (lastValue || []).some(g => g && g.shrink);

    let shrinkable = this.options.min < items.length || shrinkableData;

    if (!shrinkable) {
      return new ConstantGenerator(items);
    }

    if (shrinkableData) {
      items = lastValue.map(
        (g, i) => (g && g.shrink ? g.shrink(items[i], context) : items[i])
      );
    } else {
      items = lastValue;
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
    const { min, items } = this.options;
    const from = chance.natural({ max: items.length });
    const length = chance.natural({
      max: Math.min(items.length - from, items.length - min)
    });

    const value = items.slice();
    value.splice(from, length);

    context.childContext(this).set("lastValue", value);

    return value.map(
      item => (item && item.isGenerator ? item.generate(chance, context) : item)
    );
  }
}

module.exports = ArraySplicerGenerator;
