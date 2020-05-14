const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");
const unwrap = require("./unwrap");

class SequenceGenerator extends Generator {
  constructor(
    producerFunction,
    { min = 0, max = 30, initialValue = null } = {}
  ) {
    super("sequence", {
      producer: producerFunction,
      min,
      max,
      initialValue
    });

    if (typeof producerFunction !== "function") {
      throw new Error(
        "The sequence generator requires a producer function as first argument"
      );
    }
  }

  shrink(items) {
    const { producer, min, initialValue } = this.options;

    if (items.length === min) {
      return new ConstantGenerator(items);
    }

    return new SequenceGenerator(producer, {
      min,
      max: items.length,
      initialValue
    });
  }

  expand(items, context) {
    const { producer, max, initialValue } = this.options;

    if (items.length < max) {
      return new SequenceGenerator(producer, {
        min: items.length + 1,
        max,
        initialValue
      });
    } else {
      return new WeightedGenerator([
        [this, 1],
        [new ConstantGenerator(items), 1.5]
      ]);
    }
  }

  generate(chance, context) {
    const { producer, min, max, initialValue } = this.options;

    let producerContext = Object.create(null);

    const count = chance.natural({ min, max });
    const result = [];

    for (var i = 0; i < count; i += 1) {
      result.push(
        unwrap(
          producer(
            i === 0 ? initialValue : result[i - 1],
            producerContext,
            chance
          ),
          chance,
          context
        )
      );
    }

    return result;
  }
}

module.exports = SequenceGenerator;
