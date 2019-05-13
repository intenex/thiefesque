import defaults from 'lodash/defaults'; // // lodash is god // crazy syntax wow look into this more
import Glyph from './glyph';

export default class DynamicGlyph extends Glyph {
  constructor(properties = {}) {
    super(properties); // interesting that when you do DynamicGlyph.call(this, properties) as in a call on a constructor function directly it just runs the function that makes sense since you're literally specifying the function to call and it is a function yeah does make sense hmm functions are objects such a fascinating language man so a constructor function is just something that defines subfunctions and assigns values to keys attached to the instance objects of that constructor function with this.key
    this.name = properties.name || '';
    
    // allow for some mixin functionality
    this.attachedMixins = {}; // right these object attributes are actually stored as just strings or symbols and can be associated with p much any type of value
    this.attachedMixinGroups = {}; // specifies having some general class of functionality like movement of some sort, regardless of the specific type of movement implemented
    // set up an object for listeners
    this.listeners = {};
    this.init = {}; // just an empty object to make sure that this object doesn't get a mixin's init function written as its init function randomly when copying over defaults later on lol, otherwise useless not used
    const mixins = properties.mixins || []; // get all the mixins if any
    mixins.forEach(mixin => {
      defaults(this, mixin); // add all the properties of each mixin into the object at hand but use lodash's defaults which doesn't overwrite any existing properties which is a big no no here
      this.attachedMixins[mixin.name] = true; // add the mixin to the list of all attached mixins so you can check for inclusion of a specific mixin later just by name or by passing in the object entirely with some nice metaprogramming magic
      if (mixin.groupName) { // if a mixin belongs to a group/class of similar mixins and has a name, add it here
        this.attachedMixinGroups[mixin.groupName] = true;
      }
      // add all the listeners
      if (mixin.listeners) {
        for (const event in mixin.listeners) { // gets all the keys in an object love it
          // if don't already have a key for the event in the listeners array, add it --> note came really close to being able to use defaults here but doesn't actually quite work since you need it to push each listener into an array from multiple mixins --> likely some other lodash or utility helper library that can help with all this stuff, def read through all those later and refactor if possible where you can great learning exercise all around
          if (!this.listeners[event]) {
            this.listeners[event] = [];
          }
          // add the listener for this mixin for this specific event type
          this.listeners[event].push(mixin.listeners[event]);
        }
      }
      if (mixin.init) {
        mixin.init.call(this, properties); // hopefully this has access to properties in scope let's find out otherwise just do a normal for loop or define this function elsewhere separately, almost certain it should have access though since the function is defined here in the right scope even if passed in as a callback later that's how closures should work // call is just an immediate bind (or a bind is an immediate call), you pass in the object the 'this' scope should be and then the arguments to pass in to the call function so awesome
      }
    }); // instead of binding the function just use an arrow function lol
  }

  hasMixin(obj) {
    // check if obj or name as a string was passed in
    if (typeof obj === 'object') {
      return this.attachedMixins[obj.name]; // this is a bool that returns either true or undefined (aka false)
    } else {
      return this.attachedMixins[obj] || this.attachedMixinGroups[obj]; // check if either the specific mixin or the group mixin exists, this function can be passed either a GroupMixin name or a specific Mixin name and it'll worse for both // if typeof obj === 'string' since string is a primitive so dope
    }
  }

  // setter for name dope
  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  describe() {
    return this.name;
  }

  describeA(capitalize = false) {
    const prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    const string = this.describe();
    const firstLetter = string.charAt(0).toLowerCase();
    // if word starts with a vowel, use an, otherwise use a
    const prefix = 'aeiou'.includes(firstLetter) ? 1 : 0; // will return -1 if index not found in string love it
    return `${prefixes[prefix]} ${string}`;
  }

  describeThe(capitalize = false) {
    const prefix = capitalize ? 'The' : 'the';
    return `${prefix} ${this.describe()}`; // yeah nope you can definitely call functions with this syntax so confusing hmm
  }

  // called on specific events that can have subscribed listener callback functions that will be called when this event occurs
  raiseEvent(event, ...args) { // amazing ES6 rest operator collects all the rest of the arguments up into one array called args love it so lucky to remember all this --> and this is a real array object I believe, not an array-like object
    // make sure there's at least one listener for this event
    if (!this.listeners[event]) { return; }
    // invoke each listener, pussing this entity as the context and passing in all the arguments - remember that apply lets you pass in an array of arguments, and call lets you pass in each argument separately but otherwise they do the same things, and you could use call here all the same with ...args instead
    listeners[event].forEach(listener => {
      listener.apply(this, args); // amazing closure callback here
    });
  }
}