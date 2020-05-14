const expect = require("../test/expect");
const WeightedGenerator = require("./WeightedGenerator");
const ConstantGenerator = require("./ConstantGenerator");
const IntegerGenerator = require("./IntegerGenerator");
const StringGenerator = require("./StringGenerator");
const chanceCache = require("./chanceCache");

describe("WeightedGenerator", () => {
  beforeEach(() => {
    chanceCache.clear();
  });

  let generator;
  beforeEach(() => {
    generator = new WeightedGenerator([
      ["one", 50],
      ["two", 10],
      ["three", 30],
      ["four", 10]
    ]);
  });

  describe("when given no arguments", () => {
    it("fails", () => {
      expect(
        () => {
          new WeightedGenerator(); // eslint-disable-line no-new
        },
        "to throw",
        "Weighted require a non-empty array of items with weights"
      );
    });
  });

  it("generates items by random picking them from an array", () => {
    expect(generator, "to yield items", [
      "one",
      "three",
      "four",
      "one",
      "three"
    ]);
  });

  describe("shrink", () => {
    it("returns a constant generator with the given value", () => {
      const iterator = generator.values();

      iterator.next();
      iterator.shrink();

      expect(iterator.generator, "to satisfy", {
        options: { value: "one" }
      }).and("to be a", ConstantGenerator);
    });
  });

  describe("expand", () => {
    it("return new weighted generator where the found item is more likely to get picked again", () => {
      const iterator = generator.values();

      iterator.next();
      iterator.expand();

      expect(iterator.generator, "to satisfy", {
        options: [["two", 10], ["three", 30], ["four", 10], ["one", 50 * 1.5]]
      }).and("to be a", WeightedGenerator);
    });
  });

  describe("when the items contains generators", () => {
    beforeEach(() => {
      generator = new WeightedGenerator([
        [new IntegerGenerator({ min: 0, max: 100 }), 20],
        [new StringGenerator({ min: 5 }), 80]
      ]);
    });

    it("generates items by random picking a generator and use that to generate the next value", () => {
      expect(generator, "to yield items", [
        "n25SSlGlheH#ySk0Wbe)19*pa",
        100,
        62,
        "aFbvMTDkdv[BrHg6ToCM",
        "d@SYmHea(*)P7CwbhrYr",
        "TK9cm^CtnX3xFMpOQnc)!5"
      ]);
    });

    describe("shrink", () => {
      it("returns the shrunken generator that it was given", () => {
        const iterator = generator.values();

        iterator.next();
        iterator.shrink();

        expect(iterator.generator, "to satisfy", {
          generatorName: "stringSplicer",
          options: { text: "n25SSlGlheH#ySk0Wbe)19*pa", min: 5 }
        });
      });
    });

    describe("expand", () => {
      it("returns a weighted generator where the found item is expanded and the weight is increased", () => {
        const iterator = generator.values();

        iterator.next();
        iterator.expand();

        expect(iterator, "to yield items", [
          "TwTMaFbvMTDkdv[BrHg6ToCM[RId@S",
          "n25SSlGlheH#ySk0Wbe)19*pa",
          "n25SSlG&heH#ySk0Wbe)19*pa",
          "^@!UHyheBxXyX1RVu$PIC",
          "!41Pr5sKcM0FibGhoc%VJxPLZ^ksSE",
          "n25SSlGlheH#ySk0Wbe)19*pa",
          "xqMP0DAe)s)ssZK0wkv]ctT[LEdcu",
          "rYkNKH[OrRXf4Brr17BIU[UDN8g7",
          "n25SSlGlheH#ySk0Wbe)19*pa",
          "m8[PMNtr]g",
          "%nU5SSlGlheH$ySk0Wbe)19*pa",
          "n25SSlGlheH#yKk0Ube)19*Oa",
          ")Q)[@fvwCo!txJmB",
          "n25SSlGlheH#ySk0Wbe)19*pa",
          70
        ]);
      });
    });
  });
});
