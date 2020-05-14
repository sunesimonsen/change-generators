const Generator = require("./Generator");
const ConstantGenerator = require("./ConstantGenerator");
const WeightedGenerator = require("./WeightedGenerator");
const unwrap = require("./unwrap");

const containsGeneratorsMatching = (shape, predicate) => {
  if (!shape) {
    return false;
  } else if (Array.isArray(shape)) {
    return shape.some(item => containsGeneratorsMatching(item, predicate));
  } else if (shape.isGenerator) {
    return predicate(shape);
  } else if (typeof shape === "object") {
    return Object.keys(shape).some(key =>
      containsGeneratorsMatching(shape[key], predicate)
    );
  } else {
    return false;
  }
};

const shrink = (shape, generated, context) => {
  if (!shape) {
    return shape;
  } else if (Array.isArray(shape)) {
    return shape.map((item, i) => shrink(item, generated[i]), context);
  } else if (shape.isGenerator) {
    return shape.shrink ? shape.shrink(generated, context) : shape;
  } else if (typeof shape === "object") {
    return Object.keys(shape).reduce((result, key) => {
      result[key] = shrink(shape[key], generated[key], context);
      return result;
    }, {});
  } else {
    return shape;
  }
};

const expand = (shape, generated, context) => {
  if (!shape) {
    return shape;
  } else if (Array.isArray(shape)) {
    return shape.map((item, i) => expand(item, generated[i], context));
  } else if (shape.isGenerator) {
    return shape.expand ? shape.expand(generated, context) : shape;
  } else if (typeof shape === "object") {
    return Object.keys(shape).reduce((result, key) => {
      result[key] = expand(shape[key], generated[key], context);
      return result;
    }, {});
  } else {
    return shape;
  }
};

class ShapeGenerator extends Generator {
  constructor(shape) {
    super("shape", shape);
  }

  shrink(generated, context) {
    const isShrinkable = containsGeneratorsMatching(this.options, generator =>
      Boolean(generator.shrink)
    );

    if (isShrinkable) {
      return new ShapeGenerator(shrink(this.options, generated, context));
    } else {
      return new ConstantGenerator(generated);
    }
  }

  expand(generated, context) {
    const isExpandable = containsGeneratorsMatching(this.options, generator =>
      Boolean(generator.expand)
    );

    if (isExpandable) {
      return new WeightedGenerator([
        [new ShapeGenerator(expand(this.options, generated, context)), 1],
        [new ConstantGenerator(generated), 1.5]
      ]);
    } else {
      return new WeightedGenerator([
        [this, 1],
        [new ConstantGenerator(generated), 1.5]
      ]);
    }
  }

  generate(chance, context) {
    return unwrap(this.options, chance, context);
  }
}

module.exports = ShapeGenerator;
