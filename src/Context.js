const SimpleMap = require("./SimpleMap");

class Context {
  get(key) {
    return this.data && this.data[key];
  }

  set(key, value) {
    if (!this.data) {
      this.data = Object.create(null);
    }
    this.data[key] = value;

    return this;
  }

  has(key) {
    return this.data && key in this.data;
  }

  isEmpty() {
    return !this.data && !this.childContexts;
  }

  childContext(key) {
    if (!this.childContexts) {
      this.childContexts = new SimpleMap();
    }

    const childContext = this.childContexts.get(key);

    if (childContext) {
      return childContext;
    }

    const context = new Context();
    this.childContexts.set(key, context);

    return context;
  }
}

module.exports = Context;
