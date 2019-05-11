// awesome --> a repo has a name and a constructor
// the constructor is the constructor function that the repository uses
// to return a new object instance of that constructor function class
// a repo then holds all the templates that can be passed to that constructor function
// and can be used to easily get returned instantiated object instances of a given constructor function with any specified template or a random template

export default class Repository {
  constructor(name, ctor) {
    this.name = name;
    this.templates = {};
    this.randomTemplates = {};
    this.ctor = ctor;
  }

  // define a new named template
  define(name, template, options) {
    this.templates[name] = template;
    // apply any options
    const disableRandomCreation = options && options.disableRandomCreation; // lazy evaluation to ensure options exists at all to check the second option
    if (!disableRandomCreation) { // if disableRandomCreation returns false, then it's not disabled, and put this in the randomTemplates
      this.randomTemplates[name] = template;
    }
  }

  // create an object based on a given template
  create(name, extraProperties) {
    if (!this.templates[name]) { // right bracket notation only for variables so great
      throw new Error(`No template named '${name}' in repository '${this.name}'`);
    }

    // copy the template
    const template = Object.assign({}, this.templates[name]); // ah fascinating p sure their object.create way works because if a property isn't defined on the object itself it looks at the prototype of the object to find the property insane so incorrect but totally worked without an error // almost positive that this is the create way to copy the template, not Object.create, which sets whatever was passed in as the prototype of the object that is returned, which is always an empty object
    // apply extra properties
    if (extraProperties) {
      for (const key in extraProperties) {
        template[key] = extraProperties[key];
      }
    }

    // return the newly created object --> do the insane thing where you can literally just pass in the variable name referencing a constructor function to instantiate a new object of that constructor function makes sense I suppose, passing in the template that was found as the argument to the constructor function (currently works for both creating Entity and Item objects from those respective constructor functions)
    return new this.ctor(template);
  }

  // create an object based on a random template
  createRandom() {
    // pick a random key and create an object based off of it
    const keys = Object.keys(this.randomTemplates); // this gets an array of strings that are all the key values of the templates which correspond to the name of each template
    return this.create(keys[Math.floor(Math.random() * keys.length)]);
  }
}