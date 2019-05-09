// awesome --> a repo has a name and a constructor
// the constructor is the constructor function that the repository uses
// to return a new object instance of that constructor function class
// a repo then holds all the templates that can be passed to that constructor function
// and can be used to easily get returned instantiated object instances of a given constructor function with any specified template or a random template

class Repository {
  constructor(name, ctor) {
    this.name = name;
    this.templates = {};
    this.ctor = ctor;
  }
}

export default Repository;