const Generator = require("./Generator");
const WeightedGenerator = require("./WeightedGenerator");
const NumberGenerator = require("./NumberGenerator");
const TextGenerator = require("./TextGenerator");
const PickoneGenerator = require("./PickoneGenerator");
const createChanceProxyGeneratorFacade = require("./createChanceProxyGeneratorFacade");

class PrimitiveGenerator extends Generator {
  constructor() {
    super("primitive");

    this.composedGenerator = new WeightedGenerator([
      [new NumberGenerator(), 10],
      [new TextGenerator(), 10],
      [new PickoneGenerator([null, undefined]), 1],
      [createChanceProxyGeneratorFacade("bool"), 1]
    ]);
  }

  shrink(value) {
    return this.composedGenerator.shrink(value);
  }

  expand(value) {
    return this.composedGenerator.expand(value);
  }

  generate(chance, context) {
    return this.composedGenerator.generate(chance, context);
  }
}

module.exports = PrimitiveGenerator;
