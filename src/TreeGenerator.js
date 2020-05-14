const Generator = require("./Generator");
const ArrayGenerator = require("./ArrayGenerator");

const sliceToTree = (items, start, end, chance) => {
  const size = end - start;

  if (size === 1) {
    return items[start];
  }

  if (size === 2) {
    return items.slice(start, end);
  }

  let offset = 0;
  const result = [];

  while (offset + start < end) {
    const remainding = end - (start + offset);
    const count = Math.max(1, chance.natural({ max: size }) % remainding);
    const tree = sliceToTree(
      items,
      start + offset,
      start + offset + count,
      chance
    );

    if (count === size) {
      result.push(...tree);
    } else {
      result.push(tree);
    }

    offset += count;
  }

  return result;
};

const arrayToTree = (items, chance) => {
  if (items.length < 3) {
    return items;
  }

  return sliceToTree(items, 0, items.length, chance);
};

const mapLeaves = (tree, mapper) =>
  Array.isArray(tree) ? tree.map(v => mapLeaves(v, mapper)) : mapper(tree);

const countItems = tree =>
  Array.isArray(tree)
    ? tree.map(countItems).reduce((sum, count) => sum + count, 0)
    : 1;

class TreeGenerator extends Generator {
  constructor(itemGenerator, { min = 0, max = 30 } = {}) {
    super("tree", {
      itemGenerator,
      min,
      max
    });

    if (!itemGenerator || !itemGenerator.isGenerator) {
      throw new Error(
        "The tree generator requires an item generator as first argument"
      );
    }

    this.composedGenerator = new ArrayGenerator(itemGenerator, {
      min,
      max
    }).map(arrayToTree);
  }

  expand(value, context) {
    return this.composedGenerator.expand(value, context);
  }

  shrink(value, context) {
    return this.composedGenerator.shrink(value, context);
  }

  generate(chance, context) {
    return this.composedGenerator.generate(chance, context);
  }
}

module.exports = TreeGenerator;
