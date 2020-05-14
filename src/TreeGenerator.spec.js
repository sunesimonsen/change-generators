const expect = require("../test/expect").clone();
const TreeGenerator = require("./TreeGenerator");
const IntegerGenerator = require("./IntegerGenerator");
const chanceCache = require("./chanceCache");

const countItems = tree =>
  Array.isArray(tree)
    ? tree.map(countItems).reduce((sum, count) => sum + count, 0)
    : 1;

expect.addAssertion(
  "<array|string> to have size satisfying <assertion>",
  (expect, subject) => {
    expect.shift(countItems(subject));
  }
);

describe("TreeGenerator", () => {
  beforeEach(() => {
    chanceCache.clear();
  });

  describe("when given no arguments", () => {
    it("fails", () => {
      expect(
        () => {
          new TreeGenerator(); // eslint-disable-line no-new
        },
        "to throw",
        "The tree generator requires an item generator as first argument"
      );
    });
  });

  let generator, itemGenerator;
  describe("when only given a generator for the items", () => {
    beforeEach(() => {
      itemGenerator = new IntegerGenerator({ min: 0, max: 100 });
      generator = new TreeGenerator(itemGenerator);
    });

    it("yields random trees of items generated with the given generator", () => {
      expect(generator, "to yield items", [
        [80, [96, [18, 73], 78, 60], [[60, 15], 45], 15, 10],
        [
          [[84, 94], [21, 0, 18, 100], 18, 62],
          [[[30, 61], 53, 0, 43], 2, 29, 53],
          61,
          40,
          14,
          4,
          29,
          98
        ],
        [
          [[38, 30, [1, 9], [23, 69, 24], 44], 69, [[12, 61], 50], 84, 3],
          [17, 91],
          [39, [26, 18, 66], 76],
          [31, 42],
          52,
          21
        ],
        [
          [[83, 59, 36, 97, 28], [61, 54], [[27, 14], 29], [81, 16], 7],
          1,
          99,
          42
        ]
      ]);
    });

    describe("shrink", () => {
      it("shrinks towards the empty tree", () => {
        expect(generator, "to shrink towards", []);
      });
    });

    describe("expand", () => {
      it("produces a generator that will generate trees similar to the given value", () => {
        const iterator = generator.values();

        expect(iterator.next(), "to equal", [
          80,
          [96, [18, 73], 78, 60],
          [[60, 15], 45],
          15,
          10
        ]);

        iterator.expand();

        expect(iterator, "to yield items", [
          [45, [[15, 96], 43], [80, 60, 60, 18, 78], 73, 10, 15],
          [60, 96, [18, 73], [10, [15, 15], 45], 45, 80, 78, 60],
          [15, [[96, [73, 60], 26], 45], 15]
        ]);
      });
    });
  });

  describe("when given a minimum", () => {
    beforeEach(() => {
      generator = new TreeGenerator(
        new IntegerGenerator({ min: 0, max: 100 }),
        {
          min: 4
        }
      );
    });

    it("honor the minimum length", () => {
      expect(
        generator,
        "to yield items satisfying",
        "to have size satisfying",
        "to be within",
        generator.options.min,
        generator.options.max
      );
    });

    describe("shrink", () => {
      it("shrinks towards the minimum tree", () => {
        expect(generator, "to shrink towards", [[0, 0, 0], 0]);
      });
    });

    describe("expand", () => {
      it("honor the constaints", () => {
        const iterator = generator.values();

        iterator.next();
        iterator.expand();

        expect(
          iterator,
          "to yield items satisfying",
          "to have size satisfying",
          "to be within",
          generator.options.min,
          generator.options.max
        );
      });
    });
  });

  describe("when given both a minimum and a maximum", () => {
    beforeEach(() => {
      generator = new TreeGenerator(
        new IntegerGenerator({ min: 0, max: 100 }),
        {
          min: 4,
          max: 8
        }
      );
    });

    it("honor the constraints length", () => {
      expect(
        generator,
        "to yield items satisfying",
        "to have size satisfying",
        "to be within",
        generator.options.min,
        generator.options.max
      );
    });

    describe("expand", () => {
      it("honor the constaints", () => {
        const iterator = generator.values();

        iterator.next();
        iterator.expand();

        expect(
          iterator,
          "to yield items satisfying",
          "to have size satisfying",
          "to be within",
          generator.options.min,
          generator.options.max
        );
      });
    });
  });
});
