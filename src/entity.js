import defaults from 'lodash/defaults'; // // lodash is god // crazy syntax wow look into this more
import * as TILES from './tile';
import Glyph from './glyph';

// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

export class Entity extends Glyph {
  constructor(properties = {}, game) {
    super(properties);
    this.game = game;
    this.name = properties.name || '';
    this.x = properties.x || 0;
    this.z = properties.z || 0;
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

  setZ(z) {
    this.z = z;
  }

  getZ() {
    return this.z;
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

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  sendMessageNearby(map, centerX, centerY, currentZ, message) {
    const entities = map.getEntitiesWithinRadius(centerX, centerY, currentZ, 5); // every entity should have an associated map already but nice to make functions more pure wherever possible anyway
    // Iterate through nearby entities, sending the message if they can receive it
    entities.forEach(entity => {
      if (entity.hasMixin(Mixins.MessageRecipient)) {
        entity.receiveMessage(message);
      }
    });
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
  tryMove(x, y, z, map) { // don't even have to fucking define the attribute name for this JS is so nuts so lucky to have learned all of this
    const tile = map.getTile(x, y, this.getZ());
    const target = map.getEntityAt(x, y, this.getZ());
    // if the z level of the attempted move is different from the current z, that means
    // they're trying to ascend or descend. Ensure that this is a valid move then execute it
    if (z < this.getZ()) { // attempting to go up
      if (tile !== TILES.stairsUpTile) {
        this.sendMessage(this, `You can't go up here!`);
      } else if (z < 0) {
        this.sendMessage(this, `Sorry, these are fake stairs. No higher level.`);
      } else {
        const currentUpstairPos = this.map.getUpstairPos()[this.getZ()]; // just the current level
        const newDownstairPos = this.map.getDownstairPos()[z];
        let index;
        for (let i = 0; i < currentUpstairPos.length; i++) {
          if (currentUpstairPos[i][0] === x && currentUpstairPos[i][1] === y) {
            index = i;
          }
        }
        const newX = newDownstairPos[index][0];
        const newY = newDownstairPos[index][1];
        this.sendMessage(this, `You ascend to level ${z+1}!`); // +1 because the first level of the dungeon is denoted as 1 but stored/counted as 0
        this.setPosition(newX, newY, z); // what happens if a creature is accidentally on the stairs at time of ascension ensure that can't happen later --> maybe if this does work push the other entity to the side or something
        map.currentZ = z;
        map.removeEntity(this); // remove the entity from whatever level it's on currently (this methods needs to be more efficient code and not iterate through all the levels)
        map.entities[z].push(this); // add the entity back on the right level
      }
    } else if (z > this.getZ()) {
      if (tile !== TILES.stairsDownTile) {
        this.sendMessage(this, `You can't go down here!`);
      } else if (z >= map.depth) {
        this.sendMessage(this, `Sorry, these are fake stairs. No lower level.`);
      } else {
        const currentDownstairPos = this.map.getDownstairPos()[this.getZ()]; // just the current level
        const newUpstairPos = this.map.getUpstairPos()[z];
        let index;
        for (let i = 0; i < currentDownstairPos.length; i++) {
          if (currentDownstairPos[i][0] === x && currentDownstairPos[i][1] === y) {
            index = i;
          }
        }
        const newX = newUpstairPos[index][0];
        const newY = newUpstairPos[index][1];        this.sendMessage(this, `You descend to level ${z+1}!`);
        this.setPosition(newX, newY, z);
        map.currentZ = z;
        map.removeEntity(this); // remove the entity from whatever level it's on currently (this methods needs to be more efficient code and not iterate through all the levels)
        map.entities[z].push(this); // add the entity back on the right level
      }
    } else if (target) { // check if there's an entity at the present tile and prevent a move if so --> refactor later to check if it is an item or a creature or other unmovable object
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
    } else if (tile.isWalkable()) { // Check if you can walk onto the tile and if so walk onto it
      // update entity positoin
      this.setPosition(x, y, z);
      return true;
      // check if the tile is diggable and if so, try to dig it
    } else if (tile.isDiggable()) {
      map.dig(x, y, z);
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
    // clear the message queue on every turn
    this.clearMessages();
  }
};

Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init() {
    this.growthsRemaining = 5;
  },
  act() {
    // don't do anything if not on the same level as the player
    if (this.getZ() !== this.map.currentZ) {
      return false;
    }
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
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
            const entity = new Entity(Entities.FungusTemplate); // rough can't have a circular require makes sense lol hmm // interesting even though this code I think is run when loaded into entities the FungusTemplate has to be defined here
            entity.setPosition(
              this.getX() + xOffset,
              this.getY() + yOffset,
              this.getZ());
            this.getMap().addEntity(entity);
            this.growthsRemaining--;

            this.sendMessageNearby(this.getMap(), // okay this is amazing lol
              entity.getX(), entity.getY(), entity.getZ(),
              `The fungus is spreading!`);
          }
        }
      }
    }
  }
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
      this.getMap().destroyEntity(this);
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
  mixins: [Mixins.PlayerActor, Mixins.Moveable, 
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