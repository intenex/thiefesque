// awesome --> a repo has a name and a constructor
// the constructor is the constructor function that the repository uses
// to return a new object instance of that constructor function class
// a repo then holds all the templates that can be passed to that constructor function
// and can be used to easily get returned instantiated object instances of a given constructor function with any specified template or a random template

export default class Repository {
  constructor(name, ctor) {
    this.name = name;
    this.templates = {};
    this.ctor = ctor;
  }

  // define a new named template
  define(name, template) {
    this.templates[name] = template;
  }

  // create an object based on a given template
  create(name) {
    const template = this.templates[name];

    if (!template) {
      throw new Error(`No template named '${name}' in repository '${this.name}'`);
    }

    // return the newly created object --> do the insane thing where you can literally just pass in the variable name referencing a constructor function to instantiate a new object of that constructor function makes sense I suppose, passing in the template that was found as the argument to the constructor function (currently works for both creating Entity and Item objects from those respective constructor functions)
    return new this.ctor(template);
  }

  // create an object based on a random template
  createRandom() {
    // pick a random key and create an object based off of it
    const keys = Object.keys(this.templates); // this gets an array of strings that are all the key values of the templates which correspond to the name of each template
    return this.create(keys[Math.floor(Math.random() * keys.length)]);
  }
}