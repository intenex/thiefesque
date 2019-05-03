import defaults from 'lodash/defaults'; // // lodash is god // crazy syntax wow look into this more
import Glyph from './glyph';

// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

export class Entity extends Glyph {
  constructor(properties = {}, game) {
    super(properties);
    this.game = game;
    this.name = properties.name || '';
    this.x = properties.x || 0;
    this.y = properties.y || 0;
    this.map = null; // just putting this here so you know what properties are going to be available here, just for our own benefit in reading this later, not actually necessary, do this elsewhere too for the same reason

    // allow for some mixin functionality
    this.attachedMixins = {}; // right these object attributes are actually stored as just strings or symbols and can be associated with p much any type of value
    this.attachedMixinGroups = {}; // specifies having some general class of functionality like movement of some sort, regardless of the specific type of movement implemented
    const mixins = properties.mixins || []; // get all the mixins if any
    mixins.forEach(function(mixin) {
      defaults(this, mixin); // add all the properties of each mixin into the object at hand but use lodash's defaults which doesn't overwrite any existing properties which is a big no no here
      this.attachedMixins[mixin.name] = true; // add the mixin to the list of all attached mixins so you can check for inclusion of a specific mixin later just by name or by passing in the object entirely with some nice metaprogramming magic
      if (mixin.groupName) { // if a mixin belongs to a group/class of similar mixins and has a name, add it here
        this.attachedMixinGroups[mixin.groupName] = true;
      }
      if (mixin.init) {
        mixin.init.call(this, properties); // hopefully this has access to properties in scope let's find out otherwise just do a normal for loop or define this function elsewhere separately, almost certain it should have access though since the function is defined here in the right scope even if passed in as a callback later that's how closures should work // call is just an immediate bind (or a bind is an immediate call), you pass in the object the 'this' scope should be and then the arguments to pass in to the call function so awesome
      }
    }.bind(this)); // bind this anonymous function to the object at hand so you have access to its scope in assigning the mixins
  }

  setMap(map) {
    this.map = map;
  }

  getMap() {
    return this.map;
  }

  // setter for name dope
  setName(name) {
    this.name = name;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getName() {
    return this.name;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  hasMixin(obj) {
    // check if obj or name as a string was passed in
    if (typeof obj === 'object') {
      return this.attachedMixins[obj.name]; // this is a bool that returns either true or undefined (aka false)
    } else {
      return this.attachedMixins[obj] || this.attachedMixinGroups[obj]; // check if either the specific mixin or the group mixin exists, this function can be passed either a GroupMixin name or a specific Mixin name and it'll worse for both // if typeof obj === 'string' since string is a primitive so dope
    }
  }

  sendMessage(recipient, message) {
    // ensure the recipient can actually receive the message
    if (recipient.hasMixin(Mixins.MessageRecipient)) {
      recipient.receiveMessage(message);
    }
  }

  sendMessageNearby(map, centerX, centerY, message, args) {
    entities = map.getEntitiesWithinRadius(centerX, centerY, 5); // every entity should have an associated map already but nice to make functions more pure wherever possible anyway
    // Iterate through nearby entities, sending the message if they can receive it
    
  }
}

// love duck typing here with these Mixins and making literally
// all characters indistinguishable in implementation - makes it incredibly
// easy later on to have different races and character types for a character and
// for them to even polymorph over time. Roguelikes are such excellent tools in good
// complex system design in their total insane degree of conventional complexity and nuance
export const Mixins = {};

// entity mixin
Mixins.Moveable = {
  name: 'Moveable',
  tryMove(x, y, map) { // don't even have to fucking define the attribute name for this JS is so nuts so lucky to have learned all of this
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);
    if (target) { // check if there's an entity at the present tile and prevent a move if so --> refactor later to check if it is an item or a creature or other unmovable object
      // if this entity is an attacker, try to attack the target
      // basically this is because entities can be anything and there are presumably
      // some entities that don't attack, not just the player character but all the
      // other entities that act on their turns. have monsters attack each other in your game
      // for sure, would be amazing to have all out brawls that happen between different
      // races that patrol the dungeons and things like that
      if (this.hasMixin('Attacker')) {
        this.attack(target);
        return true;
      } else {
        // If not an attacker do nothing, but denote with a false that the entity could not move to the tile
        return false;
      }
    }
    // Check if you can walk onto the tile and if so walk onto it
    if (tile.isWalkable()) {
      // update entity positoin
      this.x = x;
      this.y = y;
      return true;
      // check if the tile is diggable and if so, try to dig it
    } else if (tile.isDiggable()) {
      map.dig(x, y);
      return true;
    }
    return false;
  }
};

Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act() {
    // Re-render the screen
    this.game.refresh();
    // Lock the engine and wait asynchronously
    // for the player to press a key
    this.getMap().getEngine().lock();
  }
};

Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  act() { } // fungus don't do anything yet lol
};

Mixins.Destructible = {
  name: 'Destructible',
  init(template) {
    this.maxHP = template.maxHP || 10;
    // gives optionality to set starting HP to something lower than max HP, that would be really cool in some future Worm lung monster shit
    this.hp = template.hp || this.maxHP;
    this.defenseValue = template.defenseValue || 0;
  },
  getHP() { return this.hp; },
  getMaxHP() { return this.maxHP; },
  getDefenseValue() { return this.defenseValue; },
  takeDamage(attacker, damage) {
    this.hp -= damage;
    // if 0 or less HP, remove from map
    if (this.hp <= 0) {
      this.sendMessage(attacker, `You kill the ${this.getName()}`);
      this.sendMessage(this, `You die!`);
      this.getMap().removeEntity(this);
    }
  }
};

Mixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init(template) {
    this.attackValue = template.attackValue || 1;
  },
  getAttackValue() { return this.attackValue; },
  attack(target) {
    // only attack the entity if they are destructible
    if (target.hasMixin('Destructible')) {
      const attack = this.getAttackValue();
      const defense = target.getDefenseValue();
      const max = Math.max(0, attack-defense);
      const damage = 1 + Math.floor(Math.random() * max);

      this.sendMessage(this, `You strike the ${target.getName()} for ${damage} damage!`);
      this.sendMessage(target, `The ${this.getName()} strikes you for ${damage} damage!`);

      target.takeDamage(this, damage); // this will do minimum 1 damage no matter what even if the defender has insanely higher defense value which can lead to some very interesting monsters who can only ever take 1 damage per turn or something
    }
  }
};

Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init() {
    this.growthsRemaining = 5;
  },
  act() {
    // see if fungus should randomly grow this turn or not
    if (this.growthsRemaining > 0) {
      if (Math.random() <= 0.03) {
        // Generate the coordinates of a random adjacent square
        // by generating an offset of either -1, 0, or 1 for both the x and y coordinates
        // To do that, generate a number from 0 to 2 and subtract one, smart lol.
        // Note that Math.random() is not inclusive of 1 so you can safely do * 3 and be assured it will never actaully equal 1 * 3 and will always round down to 2 at the highest end of things, Math.floor is great, this is a smart method for sure wow
        const xOffset = Math.floor(Math.random() * 3) - 1;
        const yOffset = Math.floor(Math.random() * 3) - 1;
        // Make sure you're not trying to spawn on the same tile as the current spawning fungus lol
        if (xOffset !== 0 || yOffset !== 0) { // as long as one of these isn't true we're good, if they're both true then it's the same square as the spawning entity and this shouldn't happen
          // make sure this location is actually a floor and if so all good
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset)) {
              const entity = new Entity(Entities.FungusTemplate); // rough can't have a circular require makes sense lol hmm // interesting even though this code I think is run when loaded into entities the FungusTemplate has to be defined here
              entity.setX(this.getX() + xOffset);
              entity.setY(this.getY() + yOffset);
              this.getMap().addEntity(entity);
              this.growthsRemaining--;
            }
        }
      }
    }
  }
};

Mixins.MessageRecipient = {
  name: 'MessageRecipient',
  init(template) {
    this.messages = [];
  },
  receiveMessage(message) {
    this.messages.push(message);
  },
  getMessages() {
    return this.messages;
  },
  clearMessages() {
    this.messages = [];
  }
};

export const Entities = {};

Entities.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  maxHP: 15,
  attackValue: 5,
  defenseValue: 2,
  mixins: [Mixins.Moveable, Mixins.PlayerActor,
  Mixins.Attacker, Mixins.Destructible,
  Mixins.MessageRecipient]
};

Entities.FungusTemplate = {
  name: 'fungus',
  character: 'F',
  foreground: 'green',
  maxHP: 6,
  mixins: [Mixins.FungusActor, Mixins.Destructible],
};