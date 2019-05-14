import merge from 'lodash/merge';
import * as ROT from 'rot-js';
import Entity from './entity';
import Repository from './repository';
import ItemRepository from './items';

// love duck typing here with these Mixins and making literally
// all characters indistinguishable in implementation - makes it incredibly
// easy later on to have different races and character types for a character and
// for them to even polymorph over time. Roguelikes are such excellent tools in good
// complex system design in their total insane degree of conventional complexity and nuance
export const EntityMixins = {};

// this mixin denotes an entity having a field of vision with a given radius
EntityMixins.Sight = {
  name: 'Sight',
  groupName: 'Sight',
  init(template) {
    this.sightRadius = template.sightRadius || 5;
  },
  getSightRadius() {
    return this.sightRadius;
  },
  increaseSightRadius(value = 1) {
    this.sightRadius += value;
    this.sendMessage(this, "You are more aware of your surroundings!");
  },
  canSee(entity) { // a more efficient way to do this specifically for seeing the player character might be to store all the entities that the player character can see and just iterate over those if everything had the same vision --> but this is much more robust but costly code
    // if not on the same map or on different floors, then exit early --> oh cool this allows you to have different maps for different dungeons with each map having multiple levels that's really dope
    if (!entity || this.map !== entity.getMap() || this.z !== entity.getZ()) {
      return false;
    }

    const x = this.getX();
    const y = this.getY();
    const otherX = entity.getX();
    const otherY = entity.getY();

    // if not in a square FOV, then won't be in a real FOV either, so this does the rough work of most calculations
    // if ((otherX - this.x) * (otherX - this.x) + // unclear why this isn't (otherX - this.x) * (otherY - this.y) > this.sightRadius * this.sightRadius to be the square field of view
    //     (otherY - this.y) * (otherY - this.y) >
    //     this.sightRadius * this.sightRadius) {
    //       return false;
    // }

    // your preferred more simple solution --> if (otherX - this.x) > this.sightRadius || (otherY - this.y) > this.sightRadius then it won't be seen in a real FOV either let's do that and then think about the other one more later
    if (Math.abs(otherX - x) > this.sightRadius ||
        Math.abs(otherY - y) > this.sightRadius) {
          return false; // yeah you like this indentation pattern better
    }

    // computer FOV and see if coordinates are in there
    let found = false;
    this.getMap().getFov(this.getZ()).compute(
      x, y, this.getSightRadius(),
      (x, y, radius, visibility) => { // callback function that's called for each visible square that lets you do something for each visible cell that's returned
        if (x === otherX && y === otherY) { // if any x and y in the callback that are returned match the otherX and otherY that means that other entity's position can be seen as this callback is called for all the positions that this entity can see pretty amazing and lucky to be able to derive all this
          found = true;
        }
      });
    return found;
  }
};

EntityMixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act() {
    // need this to not double call the act() method for the player specifically as you can be killed during the player's turn, such as by starvation during addTurnHunger, which is also protected against in the kill() method but other things we want to prevent here too in double acting for sure
    if (this.acting) {
      return;
    }
    this.acting = true;
    this.addTurnHunger(); // fascinating this happens even if you're trying to eat on that turn so you can die of starvation on the same turn that you eat since you lose hunger first before you eat lol
    // check if the game is over
    if (!this.isAlive()) {
      this.game.screens.playScreen.setGameEnded(true);
      this.sendMessage(this, `You have died. Press [escape] to continue.`);
    }
    // Re-render the screen
    this.game.refresh();
    // Lock the engine and wait asynchronously
    // for the player to press a key
    this.getMap().getEngine().lock();
    // clear the message queue on every turn
    this.clearMessages();
    this.acting = false;
  }
};

// fuck yeah AStar time
// this entity has multiple tasks with a list of priorities for each task, and will attempt to execute the highest priority task it can each turn that is available to it
EntityMixins.TaskActor = {
  name: 'TaskActor',
  groupName: 'Actor',
  init(template) {
    // load tasks
    this.tasks = template.tasks || ['wander']; // if no tasks, then only task is to wander lol
  },
  act() {
    // don't do anything if not on the same level as the player
    if (this.getZ() !== this.map.currentZ) {
      return false;
    }
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.canDoTask(this.tasks[i])) {
        // if you can perform the task, execute the function for it
        this[this.tasks[i]]();
        return true; // end the entire function love it since this is just a for loop it'll break the function, break; is to end just the loop
      }
    }
  },
  canDoTask(task) {
    if (task === 'hunt') { // make hunting more complex in the future where even if it can't see the player it'll still try hunting to the last seen spot --> it'll just continue on the last path it had where it last saw the entity and unless it sees the entity again during the time it continues to that spot it'll stop there, but if it picks up the trail again it'll start hunting actively
      return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
    } else if (task === 'wander') {
      return true;
    } else {
      throw new Error(`Tried to perform undefined task ${task}`);
    }
  },
  hunt() {
    const player = this.getMap().getPlayer();
    const x = this.getX();
    const y = this.getY();
    const z = this.getZ();
    const playerY = player.getY();
    const playerX = player.getX();
    // if adjacent to the player, then attack instead of hunting
    const offsets = Math.abs(playerX - x) +
      Math.abs(playerY - y); // this should return 1 if adjacent love it
    if (offsets === 1) {
      if (this.hasMixin('Attacker')) {
        this.attack(player);
        return;
      }
    }

    // generate the path to the player (or in the future make this code hunt other entities too) and then move to the first tile in the path (actually the second tile since the first is where we are right now)
    const path = new ROT.Path.AStar(playerX, playerY, (x, y) => {
      // if an entity is present at the tile or if the tile isn't walkable, can't move there so return false for those tiles, else return true, to generate this path on each turn love it
      const entity = this.getMap().getEntityAt(x, y, z); // a closure callback capturing z from the outside function as well as this from the outside scope thanks to this being a fat arrow function
      if (entity && entity !== player && entity !== this) {
        return false;
      }
      return this.getMap().getTile(x, y, z).isWalkable();
    }, {topology: 8});
    // move to the second tile that's passed into the callback function (the first is the entity's starting position)
    let count = 0;
    // alternatively push the entire path into an array like so:
    // const path = [];
    path.compute(x, y, (pathX, pathY) => {
      if (count === 1) {
        this.tryMove(pathX, pathY);
        // path.push([pathX, pathY]);
      }
      count++;
    });
    // path.shift();
    // this.tryMove(path[0][0], path[0][1], z);
  },
  wander() {
    // randomly decide if moving forwards or backwards
    const moveOffset = (Math.random() >= 0.5) ? 1 : -1; // love improving on code while you do it
    // randomly decide if moving x or y
    const x = this.getX();
    const y = this.getY();
    if (Math.random() >= 0.5) {
      this.tryMove(x + moveOffset, y); // make z optional in tryMove
    } else {
      this.tryMove(x, y + moveOffset);
    }
  }
};

EntityMixins.FungusActor = {
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
            const entity = EntityRepository.create('fungus'); // rough can't have a circular require makes sense lol hmm // interesting even though this code I think is run when loaded into entities the FungusTemplate has to be defined here
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

// throw in all the extra stuff to overwrite in the third object passed here, and this will set it equal to the first empty object that will have all the merged properties so great have to do it this way since merge is mutative
EntityMixins.GiantZombieActor = merge({}, EntityMixins.TaskActor, {
  init(template) {
    // call the task actor init with the right tasks lol
    EntityMixins.TaskActor.init.call(this, template);
    // only grow the arm once
    this.hasGrownArm = false;
  },
  listeners: {
    onDeath(attacker) {
      // Switch to win screen when killed
      // only works because the player entity is the only one who will kill the giant zombie
      // and that entity has the game stored in a this.game attribute but thankfully that's fine becuase this code isn't actually final code and will be overwritten in the future so it can be hacky
      attacker.game.switchScreen(attacker.game.screens.winScreen);
    }
  },
  canDoTask(task) {
    // if haven't already grown an arm and HP <= 20, then grow the arm as the first priority task
    if (task === 'growArm') {
      return this.getHP() <= 20 && !this.hasGrownArm;
    } else if (task === 'spawnSlime') {
      // only spawn a slime 10% of the time
      return Math.random() <= 0.1;
    } else {
      // the parent canDoTask can handle all the generic tasks (i.e., hunt and wander)
      return EntityMixins.TaskActor.canDoTask.call(this, task);
    }
  },
  growArm() {
    this.hasGrownArm = true;
    this.increaseAttackValue(5);
    // send a message notifying everyone that the zombie has grown an arm
    this.sendMessageNearby(this.getMap(), this.getX(), this.getY(), this.getZ(),
      `The giant zombie has grown an extra arm!`);
  },
  spawnSlime() {
    // generate random position nearby, up to 2 squares away by x and y
    const x = this.getX();
    const y = this.getY();
    const z = this.getZ();
    let xOffset = Math.floor(Math.random() * 3) - 1;
    let yOffset = Math.floor(Math.random() * 3) - 1;
    let spawnTries = 0;
    // check if an entity can be spawned at that position - if not, try 10 more random positions before giving up lol
    while (spawnTries < 10 && !this.getMap().isEmptyFloor(x + xOffset, y + yOffset, z)) {
      xOffset = Math.floor(Math.random() * 3) - 1;
      yOffset = Math.floor(Math.random() * 3) -1;
      spawnTries++;
    }
    // check if an entity can be spawned now - if still not, then just give up and hunt instead, definitely don't just do nothing and waste a turn lol
    if (!this.getMap().isEmptyFloor(x + xOffset, y + yOffset, z)) {
        if (canDoTask('hunt')) {
          this.hunt();
          return;
        } else {
          this.wander();
          return;
        }
    }
    // create the slime if all is well
    const slime = EntityRepository.create('slime');
    slime.setPosition(x + xOffset, y + yOffset, z);
    this.getMap().addEntity(slime);
  }
});

EntityMixins.Destructible = {
  name: 'Destructible',
  init(template) {
    this.maxHP = template.maxHP || 10;
    // gives optionality to set starting HP to something lower than max HP, that would be really cool in some future Worm lung monster shit
    this.hp = template.hp || this.maxHP;
    this.defenseValue = template.defenseValue || 0;
  },
  listeners: {
    details() {
      return [
        {key: 'defense', value: this.getDefenseValue()},
        {key: 'hp', value: this.getHP()}
      ];
    },
    onGainLevel() {
      // heal the entity
      this.setHP(this.getMaxHP());
    }
  },
  getHP() { return this.hp; },
  setHP(hp) { this.hp = hp; },
  getMaxHP() { return this.maxHP; },
  increaseMaxHP(value = 10) {
    // add to both max HP and current HP
    this.maxHP += value;
    this.hp += value;
    this.sendMessage(this, "You look healthier!");
  },
  getDefenseValue() { 
    let modifier = 0;
    // if you can equip items, take into consideration weapons and armor
    if (this.hasMixin(EntityMixins.Equipper)) {
      if (this.getWeapon()) {
        modifier += this.getWeapon().getDefenseValue();
      }
      if (this.getArmor()) {
        modifier += this.getArmor().getDefenseValue();
      }
    }
    return this.defenseValue + modifier;
  },
  increaseDefenseValue(value = 2) {
    // add to the defense value.
    this.defenseValue += value;
    this.sendMessage(this, "You look tougher!");
  },
  takeDamage(attacker, damage) {
    this.hp -= damage;
    // if 0 or less HP, remove from map
    if (this.hp <= 0) {
      this.sendMessage(attacker, `You kill the ${this.getName()}`);
      // raise events
      this.raiseEvent('onDeath', attacker); // the attacking entity is passed in as an argument here
      attacker.raiseEvent('onKill', this);
      this.kill("You have been killed to death.");
    }
  }
};

EntityMixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init(template) { // properties are passed in as an argument to the init call, and properties correspond to the Template that's passed in as an argument to the Entity constructor function love it
    this.attackValue = template.attackValue || 1;
  },
  listeners: {
    details() {
      return [{key: 'attack', value: this.getAttackValue()}];
    }
  },
  getAttackValue() { 
    let modifier = 0;
    // if you can equip items, take into consideration weapons and armor
    if (this.hasMixin(EntityMixins.Equipper)) {
      if (this.getWeapon()) {
        modifier += this.getWeapon().getAttackValue();
      }
      if (this.getArmor()) {
        modifier += this.getArmor().getAttackValue();
      }
    }
    return this.attackValue + modifier;
  },
  increaseAttackValue(value = 2) {
    // add to the attack value
    this.attackValue += value;
    this.sendMessage(this, "You look stronger!");
  },
  attack(target) {
    // only attack the entity if they are destructible
    if (target.hasMixin('Destructible')) {
      const attack = this.getAttackValue();
      const defense = target.getDefenseValue();
      const max = Math.max(0, attack - defense);
      const damage = 1 + Math.floor(Math.random() * max);

      this.sendMessage(this, `You strike the ${target.getName()} for ${damage} damage!`);
      this.sendMessage(target, `The ${this.getName()} strikes you for ${damage} damage!`);

      target.takeDamage(this, damage); // this will do minimum 1 damage no matter what even if the defender has insanely higher defense value which can lead to some very interesting monsters who can only ever take 1 damage per turn or something
    }
  }
};

EntityMixins.InventoryHolder = {
  name: 'InventoryHolder',
  init(template) {
    // default to 10 inventory slots.
    const inventorySlots = template.inventorySlots || 10;
    // set up a new empty inventory, one of the few times where you actually do want to instantiate the array to a bunch of empty items of a set length that will never increase unless they find some potion of inventory slot increasement or something
    this.items = new Array(inventorySlots);
  },
  getItems() {
    return this.items;
  },
  getItem(i) {
    return this.items[i];
  },
  addItem(item) {
    // try to find an empty slot in the inventory, returning true only if one was found --> if all slots are taken, don't add the item and return false, I like this actually
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        this.items[i] = item;
        return true;
      }
    }
    return false;
  },
  removeItem(i) {
    // if you can equip items, make sure the item is unequipped first
    if (this.items[i] && this.hasMixin(EntityMixins.Equipper)) {
      this.unequip(this.items[i]);
    }
    this.items[i] = null; // interesting yeah you don't set things to undefined right only null love it
  },
  canAddItem() {
    // check if there are any empty slots
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        return true;
      }
    }
    return false;
  },
  pickupItems(indices) {
    // allow the player to pickup items from the map, where indices are the indices
    // for the array of items returned by Map.getItemsAt that specifies the specific items from the total array of items that you want to pick up
    const mapItems = this.map.getItemsAt(this.getX(), this.getY(), this.getZ());
    let added = 0;
    // iterate through all indices
    for (let i = 0; i < indices.length; i++) {
      // try to add the item. If the inventory isn't full, splice the item out of the list of items.
      // In order to get the right item going forward, you then have to offset the index by the number of items already added lol
      if (this.addItem(mapItems[indices[i] - added])) { // this returns true if successful in adding the item dope
        mapItems.splice(indices[i] - added, 1);
        added++;
      } else {
        // inventory is full, stop the loop
        break;
      }
    }
    // update the items in the map - this shouldn't be necessary since mapItems should point to the same array so test it without this actually
    this.map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
    // return true only if you added all items
    return added === indices.length;
  },
  dropItem(i) {
    // drops an item to the current map tile
    if (this.items[i]) {
      if (this.map) {
        this.map.addItem(this.getX(), this.getY(), this.getZ(), this.items[i]);
      }
      this.removeItem(i);
    }
  }
};

EntityMixins.MessageRecipient = {
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

EntityMixins.ExperienceGainer = {
  name: 'ExperienceGainer',
  init(template) {
    this.level = template.level || 1;
    this.experience = template.experience || 0;
    this.statPointsPerLevel = template.statPointsPerLevel || 1;
    this.statPoints = 0;
    // which stats can be leveled
    this.statOptions = [];
    if (this.hasMixin('Attacker')) {
      this.statOptions.push(['Increase attack value', this.increaseAttackValue.bind(this), this.getAttackValue.bind(this)]); // bind these to the right entity object instance 'this' here so you don't have to bind every time you call these in the future
    }
    if (this.hasMixin('Destructible')) {
      this.statOptions.push(['Increase defense value', this.increaseDefenseValue.bind(this), this.getDefenseValue.bind(this)]);
      this.statOptions.push(['Increase max health', this.increaseMaxHP.bind(this), this.getMaxHP.bind(this)]);
    }
    if (this.hasMixin('Sight')) {
      this.statOptions.push(['Increase sight range', this.increaseSightRadius.bind(this), this.getSightRadius.bind(this)]);
    }
  },
  listeners: {
    details() {
      return [{key: 'level', value: this.getLevel()}];
    },
    onKill(victim) {
      // give attacker experience points
      let exp = victim.getMaxHP() + victim.getDefenseValue();
      if (victim.hasMixin('Attacker')) {
        exp += victim.getAttackValue();
      }
      // account for level differences
      if (victim.hasMixin('ExperienceGainer')) {
        exp -= (this.getLevel() - victim.getLevel()) * 3; // if this entity's level is higher than the attacker this will be negative, hence will be an addition
      }
      // only give exp if greater than 0
      if (exp > 0) {
        this.giveExperience(exp);
      }
    }
  },
  getLevel() {
    return this.level;
  },
  getExperience() {
    return this.experience;
  },
  getNextLevelExperience() {
    return (this.level * this.level) * 10; // the square of the level * 10 lol
  },
  getStatPoints() {
    return this.statPoints;
  },
  setStatPoints(statPoints) {
    this.statPoints = statPoints;
  },
  getStatOptions() {
    return this.statOptions;
  },
  giveExperience(points) {
    let statPointsGained = 0;
    let levelsGained = 0;
    // Loop until all points have been allocated
    while (points > 0) {
      // check if adding in the points will pass the level threshold
      if (this.experience + points >= this.getNextLevelExperience()) {
        // fill experience until the next threshold
        const usedPoints = this.getNextLevelExperience() - this.experience;
        points -= usedPoints;
        this.experience += usedPoints;
        // level up the entity!
        this.level++;
        levelsGained++;
        this.statPoints += this.statPointsPerLevel;
        statPointsGained += this.statPointsPerLevel;
      } else {
        this.experience += points;
        points = 0;
      }
    }
    // check if at least one level gained
    if (levelsGained > 0) {
      this.sendMessage(this, `You advance to level ${this.level}.`);
      this.raiseEvent('onGainLevel');
    }
  }
};

EntityMixins.FoodConsumer = {
  name: 'FoodConsumer',
  init(template) {
    this.maxFullness = template.maxFullness || 1000;
    // start half full if no default
    this.fullness = template.fullness || this.maxFullness / 2;
    // num points to decrease fullness by every turn
    this.fullnessDepletionRate = template.fullnessDepletionRate || 1;
  },
  addTurnHunger() {
    // deplete fullness by the depletion rate
    this.modifyFullnessBy(-this.fullnessDepletionRate);
  },
  modifyFullnessBy(points) {
    this.fullness = this.fullness + points;
    if (this.fullness <= 0) {
      this.kill("You have died of starvation!");
    } else if (this.fullness > this.maxFullness) {
      this.kill("You have died of overindulgence.");
    }
  },
  getHungerState() {
    // one percent of max fullness
    const percent = this.maxFullness / 100;
    // 5% of max fullness or less = starving
    if (this.fullness <= percent * 5) {
      return 'Starving';
    } else if (this.fullness <= percent * 25) {
      return 'Hungry';
    } else if (this.fullness >= percent * 95) {
      return 'Stuffed to Death';
    } else if (this.fullness >= percent * 75) {
      return 'Full';
    } else {
      return 'Not Hungry';
    }
  }
};

EntityMixins.PlayerStatGainer = {
  name: 'PlayerStatGainer',
  groupName: 'StatGainer',
  listeners: {
    onGainLevel() {
      // setup the gain stat screen and show it lol
      this.game.screens.gainStatScreen.setup(this);
      this.game.screens.playScreen.setSubScreen(this.game.screens.gainStatScreen);
    }
  }
};

EntityMixins.RandomStatGainer = {
  name: 'RandomStatGainer',
  groupName: 'StatGainer',
  listeners: {
    onGainLevel() {
      const statOptions = this.getStatOptions();
      // randomly select a stat option and execute the callback for each stat point
      while (this.getStatPoints() > 0) {
        // call a random stat increasing function
        statOptions[Math.floor(Math.random() * statOptions.length)][1]();
        this.setStatPoints(this.getStatPoints() - 1);
      }
    }
  }
};

EntityMixins.CorpseDropper = {
  name: 'CorpseDropper',
  init(template) {
    // chance of droppping a corpse out of 100
    this.corpseDropRate = template.corpseDropRate || 100;
  },
  listeners: {
    onDeath(attacker) {
      // see if we should drop a corpse
      if (Math.round(Math.random() * 100) <= this.corpseDropRate) {
        // create a new corpse item and drop it
        this.map.addItem(this.getX(), this.getY(), this.getZ(),
          ItemRepository.create('corpse', {
            name: `${this.name} corpse`,
            foreground: this.foreground // nice have the corpse inherit the color of the monster love it
          }));
      }
    }
  }
};

EntityMixins.Equipper = {
  name: 'Equipper',
  init(template) {
    this.weapon = null; // just for good form
    this.armor = null;
  },
  wield(item) {
    this.weapon = item;
  },
  unwield() {
    this.weapon = null;
  },
  wear(item) {
    this.armor = item;
  },
  takeOff() {
    this.armor = null;
  },
  getWeapon() {
    return this.weapon;
  },
  getArmor() {
    return this.armor;
  },
  unequip(item) {
    // helper function to be called to determine if weapon or armor
    if (this.weapon === item) { // weird when you call it you use this.weapon but when others call it they use entity.getWeapon()? Look into this more and the correct use cases
      this.unwield();
    } else if (this.armor === item) { // consider making this an else if --> the only case you don't want this to be an else if is if you can for some reason equip the same item twice as both a weapon and as armor which shouldn't be allowable so make sure not to allow that lol then make this an else if
      this.takeOff();
    }
  }
};

// kept out of the EntityRepo for now so it doesn't generate an automatic player template lol...would be amazing to create clones of yourself you have to fight though
export const PlayerTemplate = {
  character: '@',
  foreground: 'white',
  maxHP: 15,
  attackValue: 5,
  defenseValue: 2,
  sightRadius: 6,
  inventorySlots: 22,
  mixins: [EntityMixins.PlayerActor, EntityMixins.Sight,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.MessageRecipient, EntityMixins.InventoryHolder,
  EntityMixins.FoodConsumer, EntityMixins.Equipper,
  EntityMixins.ExperienceGainer, EntityMixins.PlayerStatGainer]
};

export const EntityRepository = new Repository('entities', Entity); // insane that you can really pass constructor functions like this as variable names man I guess they're just objects like everything else so you should be able to do this in Ruby too no?

EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'white',
  maxHP: 3,
  speed: 2000,
  attackValue: 2,
  corpseDropRate: 50,
  mixins: [EntityMixins.TaskActor, EntityMixins.CorpseDropper,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.ExperienceGainer, EntityMixins.RandomStatGainer]
});

EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'yellow',
  maxHP: 5,
  attackValue: 2,
  corpseDropRate: 75,
  mixins: [EntityMixins.TaskActor, EntityMixins.CorpseDropper,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.ExperienceGainer, EntityMixins.RandomStatGainer]
});

EntityRepository.define('kobold', {
  name: 'kobold',
  character: 'k',
  foreground: 'white',
  maxHP: 6,
  attackValue: 4,
  sightRadius: 5,
  tasks: ['hunt', 'wander'],
  mixins: [EntityMixins.TaskActor, EntityMixins.Sight,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.ExperienceGainer, EntityMixins.RandomStatGainer,
  EntityMixins.CorpseDropper]
});

EntityRepository.define('fungus', {
  name: 'fungus',
  character: 'F',
  foreground: 'green',
  speed: 250,
  maxHP: 6,
  corpseDropRate: 10,
  mixins: [EntityMixins.FungusActor, EntityMixins.Destructible,
  EntityMixins.ExperienceGainer, EntityMixins.RandomStatGainer,
  EntityMixins.CorpseDropper]
});

EntityRepository.define('slime', {
  name: 'slime',
  character: 's',
  foreground: 'lightGreen',
  maxHP: 10,
  attackValue: 5,
  sightRadius: 3,
  tasks: ['hunt', 'wander'],
  mixins: [EntityMixins.TaskActor, EntityMixins.Sight,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.ExperienceGainer, EntityMixins.RandomStatGainer,
  EntityMixins.CorpseDropper]
});

EntityRepository.define('giant zombie', {
  name: 'giant zombie',
  character: 'Z',
  foreground: 'teal',
  maxHP: 30,
  attackValue: 8,
  defenseValue: 5,
  level: 5,
  sightRadius: 6,
  tasks: ['growArm', 'spawnSlime', 'hunt', 'wander'],
  mixins: [EntityMixins.GiantZombieActor, EntityMixins.Sight,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.CorpseDropper, EntityMixins.ExperienceGainer]
}, {
  disableRandomCreation: true
});