const Generator = require("./Generator");
const StringGenerator = require("./StringGenerator");
const MagicStringGenerator = require("./MagicStringGenerator");
const ArrayGenerator = require("./ArrayGenerator");
const WeightedGenerator = require("./WeightedGenerator");
const createChanceProxyGeneratorFacade = require("./createChanceProxyGeneratorFacade");

class TextGenerator extends Generator {
  constructor() {
    super("text");

    this.composedGenerator = new WeightedGenerator([
      [createChanceProxyGeneratorFacade("paragraph"), 10],
      [createChanceProxyGeneratorFacade("sentence"), 20],
      [createChanceProxyGeneratorFacade("syllable"), 10],
      [createChanceProxyGeneratorFacade("word"), 10],
      [new StringGenerator(), 20],
      [new MagicStringGenerator(), 20],
      [
        new ArrayGenerator(
          new WeightedGenerator([
            [new MagicStringGenerator(), 60],
            [new StringGenerator({ max: 7 }), 40]
          ]),
          { max: 10 }
        ).map(strings => strings.join("")),
        5
      ]
    ]);
  }

  shrink(text, context) {
    return new StringGenerator({ max: text.length }).shrink(text, context);
  }

  expand(text, context) {
    return new StringGenerator({ max: text.length + 10 }).expand(text, context);
  }

  generate(chance, context) {
    return this.composedGenerator.generate(chance, context);
  }
}

module.exports = TextGenerator;
