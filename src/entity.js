import * as TILES from './tile';
import DynamicGlyph from './dynamicglyph';
import { EntityMixins } from './entities';

// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

export default class Entity extends DynamicGlyph {
  constructor(properties = {}, game) {
    super(properties);
    this.game = game;
    this.alive = true;
    this.x = properties.x || 0;
    this.z = properties.z || 0;
    this.y = properties.y || 0;
    this.map = null; // just putting this here so you know what properties are going to be available here, just for our own benefit in reading this later, not actually necessary, do this elsewhere too for the same reason
  }

  setMap(map) {
    this.map = map;
  }

  getMap() {
    return this.map;
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

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setPosition(x, y, z) {
    const oldX = this.x;
    const oldY = this.y;
    const oldZ = this.z;
    // update position
    this.x = x;
    this.y = y;
    this.z = z;
    // if the entity is already on a map, tell the map that the entity has moved
    if (this.map) {
      this.map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
  }

  isAlive() {
    return this.alive;
  }

  kill(message) {
    
  }

  tryMove(x, y, z = this.getZ()) { // don't even have to fucking define the attribute name for this JS is so nuts so lucky to have learned all of this
    const map = this.getMap();
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
        this.sendMessage(this, `You ascend to level ${z + 1}!`); // +1 because the first level of the dungeon is denoted as 1 but stored/counted as 0
        this.setPosition(newX, newY, z); // what happens if a creature is accidentally on the stairs at time of ascension ensure that can't happen later --> maybe if this does work push the other entity to the side or something
        map.currentZ = z;
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
        const newY = newUpstairPos[index][1];
        this.sendMessage(this, `You descend to level ${z + 1}!`);
        this.setPosition(newX, newY, z);
        map.currentZ = z;
      }
    } else if (target) { // check if there's an entity at the present tile and prevent a move if so
      // if this entity is an attacker, try to attack the target
      // basically this is because entities can be anything and there are presumably
      // some entities that don't attack, not just the player character but all the
      // other entities that act on their turns. have monsters attack each other in your game
      // for sure, would be amazing to have all out brawls that happen between different
      // races that patrol the dungeons and things like that
      if (this.hasMixin('Attacker') && this.hasMixin(EntityMixins.PlayerActor) ||
          target.hasMixin(EntityMixins.PlayerActor)) { // only allow for an attack if it is the player attacking or if the target of the entity is the player
        this.attack(target);
        return true;
      } else {
        // If not an attacker do nothing, but denote with a false that the entity could not move to the tile
        return false;
      }
    } else if (tile.isWalkable()) { // Check if you can walk onto the tile and if so walk onto it
      // update entity positoin
      this.setPosition(x, y, z);
      // notify the entity if there are items at this position
      const items = this.getMap().getItemsAt(x, y, z);
      if (items) {
        if (items.length === 1) {
          this.sendMessage(this, `You see ${items[0].describeA()}.`);
        } else {
          this.sendMessage(this, `You see several objects here.`);
        }
      }
      return true;
      // check if the tile is diggable and if so, try to dig it --> but only if it's the player character trying to dig
    } else if (tile.isDiggable() && this.hasMixin(EntityMixins.PlayerActor)) {
      map.dig(x, y, z);
      return true;
    }
    return false;
  }

  sendMessage(recipient, message) {
    // ensure the recipient can actually receive the message
    if (recipient.hasMixin(EntityMixins.MessageRecipient)) {
      recipient.receiveMessage(message);
    }
  }

  sendMessageNearby(map, centerX, centerY, currentZ, message) {
    const entities = map.getEntitiesWithinRadius(centerX, centerY, currentZ, 5); // every entity should have an associated map already but nice to make functions more pure wherever possible anyway
    // Iterate through nearby entities, sending the message if they can receive it
    entities.forEach(entity => {
      if (entity.hasMixin(EntityMixins.MessageRecipient)) {
        entity.receiveMessage(message);
      }
    });
  }
}