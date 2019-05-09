class Repository {
  constructor(name, ctor) {
    this.name = name;
    this.templates = {};
    this.ctor = ctor;
  }
}

export default Repository;