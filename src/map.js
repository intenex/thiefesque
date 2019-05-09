import * as ROT from 'rot-js';
import * as TILES from './tile';
import { EntityRepository } from './entity';
import ItemRepository from './items';

export default class Map {
  constructor(tiles, player, upstairPos, downstairPos) {
    this.tiles = tiles;
    this.upstairPos = upstairPos;
    this.downstairPos = downstairPos;
    // cache dimensions
    this.depth = tiles.length;
    this.width = tiles[0].length; // ah right all the columns makes sense dope a 2D array of tiles
    this.height = tiles[0][0].length; // a single column of all the rows
    // setup the field of vision for the player
    this.fov = [];
    this.setupFov();
    // setup the array of all previously explored tiles
    this.exploredTiles = [];
    this.setupExploredArray();
    // create an object that will hold all the entities namespaced in the object with keys representing each z level of depth in the dungeon
    this.entities = {}; // all the z levels are attributes on this object and point to an array of entities on each level // keep track of all entities on a given map in a list
    // instantiate an empty object for each z level as a key in the entities hash
    for (let z = 0; z < this.depth; z++) {
      this.entities[z] = {};
    }
    // create an object of all items
    this.items = {};
    for (let z = 0; z < this.depth; z++) { // treat items just like entities namespace them by level
      this.items[z] = {};
    }
    this.currentZ = 0; // so you can reference this in act methods
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);
    this.addEntityAtRandomPosition(player, this.currentZ); // have a single source of truth for all these numbers 
    for (let z = 0; z < this.depth; z++) {
      // add 25 random monsters on every level
      for (let i = 0; i < 25; i++) {
        // randomly select a template
        this.addEntityAtRandomPosition(EntityRepository.createRandom(), z);
      }
      // ten random items per floor
      for (let i = 0; i < 10; i++) {
        // add a random item
        this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
      }
    }
    
  
  }

  getEngine() {
    return this.engine;
  }

  getEntities() {
    return this.entities;
  }

  getUpstairPos() {
    return this.upstairPos;
  }

  getDownstairPos() {
    return this.downstairPos;
  }

  getEntityAt(x, y, z) {
    if (!this.entities[z]) {
      return false;
    }
    return this.entities[z][`${x},${y}`]; // keep entities still namespaced by a z to make searching just the entities on a given level possible
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getDepth() {
    return this.depth;
  }

  // get the tile for a given coordinate set
  getTile(x, y, z) {
    // Make sure you're inside bounds. If not, return the null tile, right this Null Object pattern allows you to be able to treat all tiles the same even if they don't exist instead of separately having to do null checks all the time
    if (x < 0 || x >= this.width ||
        y < 0 || y >= this.height ||
        z < 0 || z >= this.depth ) { // right length must start counting from 1 not 0 so >= is correct
      return TILES.nullTile;
    } else {
      return this.tiles[z][x][y] || TILES.nullTile; // if you're to do this why have a bounds check at all it'll just be undefined anyway sigh
    }
  }

  dig(x, y, z) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y, z).isDiggable()) {
      this.tiles[z][x][y] = TILES.floorTile;
    }
  }

  // to get the random starting position for the player so great heh
  getRandomFloorPosition(z) {
    // Randomly identify a tile that's a floor tile lol definitely a better way to do this but whatever
    let x, y;
    do {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.width);
    } while(!this.isEmptyFloor(x, y, z)); // if either of these conditions returns true keep checking --> the second will return true if any entity is found, which means it's not a valid starting position
    return {x, y, z}; // JS is magic and will literally just translate this to {x: x, y: y}
  }

  addEntity(entity) {
    // set the entity's map
    entity.setMap(this);
    // Add the entity to this map's list of entities
    this.updateEntityPosition(entity);
    // check if this entity is an actor, and if so add them to the scheduler
    if (entity.hasMixin('Actor')) {
      this.scheduler.add(entity, true); // true I believe readds them again after they act or something like that look into it again so they're not just one time
    }
  }

  addEntityAtRandomPosition(entity, z) {
    const position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
  }

  destroyEntity(entity) {
    this.removeEntity(entity);
    // If the entity is an actor, remove them from the scheduler, brilliant
    if (entity.hasMixin('Actor')) {
      this.scheduler.remove(entity);
    }
  }

  // a method to just remove the entity without removing it from the scheduler, useful currently for having the player move between levels without removing them inadvertently from the scheduler
  removeEntity(entity) {
    // Find entity in the list of entities if present
    // first get all the z levels as keys in the object array to iterate through
    const key = `${entity.getX()},${entity.getY()}`;
    const z = entity.getZ();
    if (this.entities[z][key] === entity) {
      delete this.entities[z][key];
    }
  }

  isEmptyFloor(x, y, z) {
    // Check if the tile is an empty floor tile aka one with no entity
    return this.getTile(x, y, z) === TILES.floorTile && !this.getEntityAt(x, y, z);
  }

  getEntitiesWithinRadius(centerX, centerY, currentZ, radius) {
    const boundedEntities = [];
    // determine bounds
    const leftX = centerX - radius;
    const rightX = centerX + radius;
    const topY = centerY - radius;
    const bottomY = centerY + radius;
    // iterate through all entitites within the bounds specified
    // there most certainly must be a better way to do all these things by
    // storing a reference of every entity at every X and Y position somewhere
    // entity finding by coordinates happens way too often such that this is almost
    // certainly worth optimizing at some point, esp if you have huge #s of entities
    for (const key in this.entities[currentZ]) {
      const entity = this.entities[currentZ][key];
      if (entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() <= bottomY) {
        boundedEntities.push(entity);
      }
    }
    return boundedEntities;
  }

  updateEntityPosition(entity, oldX, oldY, oldZ) {
    // delete the old key if it's the same entity and we have old positions, these are optional
    if (oldX !== undefined) {
      const oldKey = `${oldX},${oldY}`;
      if (this.entities[oldZ][oldKey] === entity) {
        delete this.entities[oldZ][oldKey]; // look into delete more this is interesting
      }
    }
    // make sure the entity's position is within bounds
    const x = entity.getX();
    const y = entity.getY();
    const z = entity.getZ();
    if (x < 0 || x >= this.width ||
        y < 0 || y >= this.height ||
        z < 0 || z >= this.depth) {
          throw new Error("Entity's position is out of bounds.");
    }
    // make sure there is no entity at the new position
    const key = `${x},${y}`;
    if (this.entities[z][key]) {
      throw new Error("Tried to add an entity at an occupied position.");
    }
    // Add the entity to the object of all entities
    this.entities[z][key] = entity;
  }

  setupFov() {
    // iterate through each depth level, setting up the field of vision
    for (let z = 0; z < this.depth; z++) { // conditional blocks don't create their own scope so this with an arrow function should be fine in here but let's see // in fact may not need the secondary scope at all because const and let are block scoped and not function scoped for this exact reason ah yes that makes sense right you don't want the variable hoisted out of the loop because you want to make it anew every time love it brilliant heh so no need of any of that workaround stuff in ES5 this is a perfect shining example of ES6 crushing it this guy does know his JS so great
      this.fov.push(new ROT.FOV.DiscreteShadowcasting((x, y) => {
        return !this.getTile(x, y, z).isBlockingLight();
      }, {topology: 4})); // clear what topology does, but note that this is not the sight radius, more likely 4 levels of grading of how far a given tile can let you see (e.g. 4 for top of a mountain, and 1 for like being in a valley or something) // and for each tile if the tile returns true for blocking light then return false so that that tile is not visible and does not project light farther, love it, and if it is false and does not block light then return true for light passes through it
    }
  }

  getFov(depth) { // note that this returns a ROT.FOV.DiscreteShadowcasting object that was instantiated for each depth of the this.fov push in setupFov()
    return this.fov[depth]; // right have to use bracket notation when using a variable name because dot notation converts it to a string and doesn't reference variables, only bracket notation references variables love it love actually getting this stuff and why the jslinter says to do things one way or another - with the normal bracket notation only use it for variables and not strings, and use dot notation for strings and not variables love it that's a good rule of thumb for now
  }

  setupExploredArray() {
    for (let z = 0; z < this.depth; z++) {
      this.exploredTiles[z] = []; // same as this.exploredTiles.push([]);
      for (let x = 0; x < this.width; x++) {
        this.exploredTiles[z][x] = []; // same as this.exploredTiles[z].push([]);
        for (let y = 0; y < this.height; y++) {
          this.exploredTiles[z][x][y] = false; // likely don't actually have to explicitly set this and can just let it implicitly fail with an undefined but doesn't hurt to do this minor performance cost
        }
      }
    }
  }

  // set a tile to either an explored (true) or unexplored (false) state, like if you get hit over the head really hard and get amnesia or lose your map or something, that'd be cool if you have to keep a map item on you that maps where you've explored and if it burns up or something you forget everything and have to start over with a new map object
  setExplored(x, y, z, state) {
    // only update the tile if it's within bounds
    if (this.getTile(x, y, z) !== TILES.nullTile) { // remember that getTile returns either TILES.nullTile if out of bounds or the tile isn't defined/found or the tile if it is
      this.exploredTiles[z][x][y] = state;
    }
  }

  isExplored(x, y, z) {
    // only return the value if within bounds
    if (this.getTile(x, y, z) !== TILES.nullTile) {
      return this.exploredTiles[z][x][y];
    } else {
      return false; // could honestly just do a ternary like (this.explored[z][x][y] !== undefined) ? this.explored[z][x][y] : false;
    }
  }

  getItemsAt(x, y, z) {
    return this.items[z][`${x},${y}`];
  }

  setItemsAt(x, y, z, items) {
    const key = `${x},${y}`;
    // if the items array is empty, delete the key from the table
    if (items.length === 0) {
      if (this.items[z][key]) {
        delete this.items[z][key];
      }
    } else {
      // update the items at the given key
      this.items[z][key] = items;
    }
  }

  addItem(x, y, z, item) {
    // if items already exist at this position, just append, otherwise create a new array object with that item as the only initial element
    const key = `${x},${y}`;
    if (this.items[z][key]) {
      this.items[z][key].push(item);
    } else {
      this.items[z][key] = [item];
    }
  }

  addItemAtRandomPosition(item, z) {
    const pos = this.getRandomFloorPosition(z);
    this.addItem(pos.x, pos.y, pos.z, item);
  }
}