const chanceCache = require("./chanceCache");
const Chance = require("chance");
const Context = require("./Context");

class GeneratorIterator {
  constructor(generator, { seed = 42, skipSeedCache = false } = {}) {
    this.isGeneratorIterator = true;
    this.isShrinkable = Boolean(generator.shrink);
    this.isExpandable = Boolean(generator.expand);
    this.generator = generator;
    this.seed = seed == null ? Math.round(Math.random() * 10000) : seed;
    this.context = new Context();

    if (skipSeedCache) {
      this.chance = new Chance(seed);
    } else {
      this.chance = chanceCache.get(seed);
    }
  }

  shrink(value) {
    if (this.isShrinkable) {
      this.generator = this.generator.shrink(value);
      this.context = new Context();
      this.isShrinkable = Boolean(this.generator.shrink);
    }
  }

  expand(value) {
    if (this.isExpandable) {
      this.generator = this.generator.expand(value);
      this.context = new Context();
      this.isExpandable = Boolean(this.generator.expand);
    }
  }

  take(count) {
    if (typeof count !== "number" || count < 1) {
      throw new Error(
        "The take method requires a positive number as parameter"
      );
    }

    const result = new Array(count);
    for (var i = 0; i < count; i += 1) {
      result[i] = this.next();
    }
    return result;
  }

  next() {
    return this.generator.generate(this.chance, this.context);
  }
}

module.exports = GeneratorIterator;
