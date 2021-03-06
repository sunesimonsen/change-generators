const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");

class PicksetGenerator extends Generator {
  constructor(items = [], { min = 0, max = items.length } = {}) {
    super("pickset", {
      items,
      min,
      max
    });

    if (items.length === 0) {
      throw new Error("Pickset require a non-empty array of items");
    }
  }

  shrink(items) {
    if (items.length === 0) {
      return new ConstantGenerator([]);
    }

    const shrinkableData =
      items.length < 10 &&
      items === this.lastUnwrappedValue &&
      (this.lastValue || []).some(g => g && g.shrink);

    let shrinkable = items.length < this.options.max || shrinkableData;

    if (!shrinkable) {
      return new ConstantGenerator(items);
    }

    if (shrinkableData) {
      items = this.lastValue.map(
        (g, i) => (g && g.shrink ? g.shrink(items[i]) : items[i])
      );
    } else {
      items = this.lastValue;
    }

    return new PicksetGenerator(items, {
      min: this.options.min,
      max: items.length
    });
  }

  expand(data) {
    return this.map((items, chance) => {
      const margin = Math.max(
        Math.min(
          Math.floor((items.length - data.length) / 2),
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
          result[i] = items[i++];
        }
      }

      for (let j = 0; j < data.length; i++, j++) {
        result[i] = chance.bool({ likelihood: 95 })
          ? data[j]
          : items[i % items.length];
      }

      if (includeRightMargin) {
        while (i < result.length) {
          result[i] = items[i++];
        }
      }

      return result;
    });
  }

  generate(chance, context) {
    const { items, min, max } = this.options;

    this.lastValue = chance.pickset(items, chance.natural({ min, max }));

    this.lastUnwrappedValue = this.lastValue.map(
      item => (item && item.isGenerator ? item.generate(chance, context) : item)
    );

    return this.lastUnwrappedValue;
  }
}

module.exports = PicksetGenerator;
