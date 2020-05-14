const expect = require("../test/expect");
const StringGenerator = require("./StringGenerator");
const chanceCache = require("./chanceCache");
const { animal, bool } = require("./index");

describe("MappingGenerator", () => {
  beforeEach(() => {
    chanceCache.clear();
  });

  const generator = new StringGenerator({ min: 10 });
  const mapGenerator = generator.map(s => s.toUpperCase());

  it("returns a new generator", () => {
    expect(mapGenerator, "to satisfy", {
      isGenerator: true
    });
  });

  it("returns a new generator that is a mapping over the original generator", () => {
    expect(mapGenerator, "to yield items", [
      "(N25SSLGLHEH#YSK0",
      "E)19*PAN]NTWTMAFBVMTDKD",
      "BRHG6TOCM[RID@SY",
      "EA(*)P7CWBHRY",
      "YJTK9CM^CTNX3XF"
    ]);
  });

  it("unwraps returned values", () => {
    expect(
      bool.map(hasAnimal => (hasAnimal ? animal : null)),
      "to yield items",
      ["Tarantula", "Rabbits", null, null, "Bald Eagle"]
    );
  });

  describe("shrink", () => {
    it("shrinks the parent generator and maps it again", () => {
      expect(mapGenerator, "to shrink towards", "(LHEH#YSK0");
    });
  });

  describe("expand", () => {
    it("expands the parent generator and maps it again", () => {
      const iterator = mapGenerator.values();

      iterator.next();
      iterator.expand();

      expect(iterator, "to yield items", [
        "E)1(N25SSLGLTEH#YSK0",
        "A(N25SSLGLHEH#YJK09",
        "(%25SSLGLHEH)YSK0U",
        "(N25SSLGLHEH#YSK0",
        "(N25SSLGLHEH#YSK0"
      ]);
    });
  });
});
