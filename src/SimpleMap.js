class SimpleMap {
  constructor() {
    this.keys = [];
    this.values = [];
  }

  set(key, value) {
    const index = this.keys.indexOf(key);

    if (index === -1) {
      this.keys.push(key);
      this.values.push(value);
    } else {
      this.keys[index] = key;
      this.values[index] = value;
    }
  }

  get(key) {
    const index = this.keys.indexOf(key);

    return this.values[index];
  }
}

module.exports = typeof Map === "function" ? Map : SimpleMap;
