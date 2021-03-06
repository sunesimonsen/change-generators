const expect = require("../test/expect");
const ShapeGenerator = require("./ShapeGenerator");
const StringGenerator = require("./StringGenerator");
const IntegerGenerator = require("./IntegerGenerator");
const Producer = require("./Producer");
const ArrayGenerator = require("./ArrayGenerator");
const chanceCache = require("./chanceCache");

describe("ShapeGenerator", () => {
  beforeEach(() => {
    chanceCache.clear();
  });

  let generator;
  beforeEach(() => {
    generator = new ShapeGenerator({
      nested: {
        id: new Producer(last => last + 1, 0),
        numbers: [
          new IntegerGenerator({ min: 0, max: 100 }),
          new IntegerGenerator({ min: 500, max: 1000 })
        ],
        strings: [new StringGenerator(), new StringGenerator({ max: 5 })]
      },
      arrays: new ArrayGenerator(new IntegerGenerator({ min: 0, max: 100 }), {
        max: 5
      })
    });
  });

  it("unwraps all of the generators in the given structure", () => {
    expect(generator, "to yield items", [
      {
        nested: {
          id: 0,
          numbers: [37, 899],
          strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
        },
        arrays: [53]
      },
      {
        nested: {
          id: 1,
          numbers: [61, 700],
          strings: ["v[Br", "6T"]
        },
        arrays: [38]
      },
      {
        nested: {
          id: 2,
          numbers: [51, 992],
          strings: ["d@SYmHea(*)P7Cwbhr", "GYjT"]
        },
        arrays: [84, 3]
      },
      {
        nested: {
          id: 3,
          numbers: [17, 955],
          strings: ["nX3xFMpOQnc)", "H*D%&"]
        },
        arrays: [73, 93, 32]
      },
      {
        nested: {
          id: 4,
          numbers: [8, 785],
          strings: ["d)y!C3", "9"]
        },
        arrays: [36, 97, 28]
      }
    ]);
  });

  describe("shrink", () => {
    it("returns a new shape generator where all generators in the structure has been shunken", () => {
      const value = generator.first();
      expect(generator.shrink(value), "to satisfy", {
        isGenerator: true,
        generatorName: "shape",
        options: {
          nested: {
            numbers: [
              {
                generatorName: "integer",
                options: { min: 0, max: 37 }
              },
              {
                generatorName: "integer",
                options: { min: 500, max: 899 }
              }
            ],
            strings: [
              {
                generatorName: "stringSplicer",
                options: {
                  text: "25SSlGlheH#ySk0Wbe)19*pan]nTw",
                  min: 0
                }
              },
              {
                generatorName: "stringSplicer",
                options: {
                  text: "aFb",
                  min: 0
                }
              }
            ]
          },
          arrays: {
            generatorName: "arraySplicer",
            options: {
              items: [
                { generatorName: "integer", options: { min: 0, max: 53 } }
              ],
              min: 0
            }
          }
        }
      });
    });

    it("shrinks all of the generators in the shape with regards to the given structure", () => {
      const value = generator.first();
      expect(generator.shrink(value), "to yield items", [
        {
          nested: {
            id: 0,
            numbers: [23, 659],
            strings: ["25SSGlheH#ySk0Wbe)19*pan]nTw", "a"]
          },
          arrays: [24]
        },
        {
          nested: {
            id: 1,
            numbers: [3, 814],
            strings: ["25SSlGlheH#ySk0Wbe9*pan]nTw", "ab"]
          },
          arrays: [25]
        },
        {
          nested: {
            id: 2,
            numbers: [1, 843],
            strings: ["25SSlGlheH#ySk0WbenTw", "Fb"]
          },
          arrays: [51]
        },
        {
          nested: {
            id: 3,
            numbers: [35, 886],
            strings: ["25SSlGlheH#ySk0WTw", "aFb"]
          },
          arrays: [12]
        },
        {
          nested: {
            id: 4,
            numbers: [26, 596],
            strings: ["25SSlGlheH#ySn]nTw", "b"]
          },
          arrays: []
        }
      ]);
    });

    it("shrinks towards the minimal structure", () => {
      expect(generator, "to shrink towards", {
        nested: { id: 0, numbers: [0, 500], strings: ["", ""] },
        arrays: []
      });
    });
  });

  describe("expand", () => {
    it("expands all of the generators in the shape with regards to the given structure", () => {
      const value = generator.first();
      expect(generator.expand(value), "to yield items", [
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53]
        },
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#HSk0Wbe)19*pan]nTw", "taFbx"]
          },
          arrays: [97]
        },
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53]
        },
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53]
        },
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53]
        },
        {
          nested: {
            id: 0,
            numbers: [37, 899],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53]
        },
        {
          nested: {
            id: 1,
            numbers: [93, 945],
            strings: ["25SSlGlheH#ySk0Wbe)19*pan]nTw", "aFb"]
          },
          arrays: [53, 76]
        }
      ]);
    });
  });
});
