module.exports = require("unexpected")
  .clone()
  .addType({
    base: "object",
    name: "Generator",
    identify: v => v && v.isGenerator,
    inspect: (v, depth, output, inspect) => {
      output.jsFunctionName(v.generatorName);

      if (typeof v.options !== "undefined") {
        output
          .text("(")
          .appendInspected(v.options)
          .text(")");
      }
    }
  })
  .addType({
    base: "object",
    name: "GeneratorIterator",
    identify: v => v && v.isGeneratorIterator,
    inspect: (v, depth, output, inspect) => {
      output.jsFunctionName(v.generator.generatorName);

      if (typeof v.options !== "undefined") {
        output
          .text("(")
          .appendInspected(v.generator.options)
          .text(").")
          .jsFunctionName("values")
          .text("()");
      }
    }
  })
  .addType({
    base: "object",
    name: "MappingGenerator",
    identify: v => v && v.isMappedGenerator,
    inspect: (v, depth, output, inspect) => {
      output.appendInspected(v.parentGenerator);
      output.text(".").jsFunctionName(v.generatorName);
      output
        .text("(")
        .appendInspected(v.mapper)
        .text(")");
    }
  })
  .addAssertion(
    "<array|string> to have length satisfying <assertion>",
    (expect, subject) => {
      expect.shift(subject.length);
    }
  )
  .addAssertion(
    "<Generator|GeneratorIterator> to yield items <array>",
    (expect, subject, values) => {
      expect.errorMode = "nested";
      expect(subject.take(values.length), "to equal", values);
    }
  )
  .addAssertion(
    "<Generator|GeneratorIterator> to yield items satisfying <any>",
    (expect, subject, value) => {
      expect.errorMode = "nested";
      expect(
        subject.take(10),
        "to have items satisfying",
        expect.it("to satisfy", value)
      );
    }
  )
  .addAssertion(
    "<Generator|GeneratorIterator> to yield items satisfying <assertion>",
    (expect, subject) => {
      expect.errorMode = "nested";
      subject.take(10).forEach(item => {
        return expect.shift(item);
      });
    }
  )
  .addAssertion(
    "<GeneratorIterator> to shrink towards <any>",
    (expect, subject, value) => {
      expect.errorMode = "nested";

      let count = 0;
      while (subject.isShrinkable && count < 100) {
        subject.next();
        subject.shrink();
        count++;
      }

      if (count === 100) {
        expect.fail("Could not shrink in 100 iterations");
      }

      expect(subject.next(), "to equal", value);
    }
  )
  .addAssertion(
    "<Generator> to shrink towards <any>",
    (expect, subject, value) => {
      expect.errorMode = "bubble";

      expect(subject.values(), "to shrink towards", value);
    }
  )
  .addAssertion("<number> [not] to be an integer", (expect, subject) => {
    expect(Number.isInteger(subject), "[not] to be true");
  });
