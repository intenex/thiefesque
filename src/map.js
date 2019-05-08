import * as ROT from 'rot-js';
import * as TILES from './tile';
import { Entity, Entities } from './entity';

class Map {
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
    this.currentZ = 0; // so you can reference this in act methods
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);
    this.addEntityAtRandomPosition(player, this.currentZ); // have a single source of truth for all these numbers 
    // add 25 random fungi on every level for (let z = 0; z < this.depth, z++) {}
    for (let z = 0; z < this.depth; z++) {
      for (let i = 0; i < 25; i++) {
        this.addEntityAtRandomPosition(new Entity(Entities.FungusTemplate), z);
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

  // okay obviously in the long run you'll have to segregate searching by entities
  // by level that would be ideal hmm entities should be an object with z values as all the attributes
  // and each z level points to an array of all the entities on that level that would
  // save a ton of indexing and search time but requires some serious refactoring consider later
  getEntityAt(x, y, z) {
    // Iterate through all entities searching for one with the matching position hmmmm should be stored in some hash format for better searching then
    // right this is such horribly inefficient look up time this should be refactored to be stored as an object with x, y coordinates as the lookup array key, a map object
    // would be ideal for that, ah but the problem is the coordinates change with time hmm maybe updating some hash map object with the new position of every entity on every move
    // would still function well but also there aren't that many entities ever that this is such an issue deal with it later
    if (!this.entities[z]) { // check that this exists first, it should, but doesn't hurt to check
      return false;
    }
    for (let i = 0; i < this.entities[z].length; i++) {
      if (this.entities[z][i].getX() === x &&
          this.entities[z][i].getY() === y) {
            return this.entities[z][i];
          }
    }
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
    // Make sure the entity's position is within bounds
    if (entity.getX() < 0 || entity.getX() >= this.width ||
        entity.getY() < 0 || entity.getY() >= this.height ||
        entity.getZ() < 0 || entity.getZ() >= this.depth) {
          throw new Error('Adding entity out of bounds.');
    }
    // set the entity's map
    entity.setMap(this);
    // Add the entity to this map's list of entities
    const z = entity.getZ();
    if (this.entities[z]) { // if the level has already been instantiated before it'll already be an array of entities and just push into it
      this.entities[z].push(entity);
    } else { // otherwise if this.entities.z is undefined then set that key to a new entity wrapped in an array
      this.entities[z] = [entity];
    }
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
    Object.keys(this.entities).forEach(z => {
      // iterate through the whole array for each level until the entity is found --> ideally just refactor removeEntity to only search one level and to know what level to search from the beginning
      for (let i = 0; i < this.entities[z].length; i++) {
        if (this.entities[z][i] === entity) {
          this.entities[z].splice(i, 1); // remove 1 element starting from that index spot where the entity was found, i.e. remove that entity from the list of entities
          break; // end the for loop as soon as the entity is found if found
        }
      }
    });
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
    this.entities[currentZ].forEach(entity => {
      if (entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() <= bottomY) {
        boundedEntities.push(entity);
      }
    });
    return boundedEntities;
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
      this.exploredTiles[z] = [];
      for (let x = 0; x < this.width; x++) {
        this.exploredTiles[z][x] = [];
        for (let y = 0; y < this.height; y++) {
          this.exploredTiles[z][x][y] = false; // likely don't actually have to explicitly set this and can just let it implicitly fail with an undefined but doesn't hurt to do this minor performance cost
        }
      }
    }
  }

  setExplored(x, y, z, state) {
    // only update the tile if it's within bounds
    if (this.getTile(x, y, z) !== TILES.nullTile) {
      this.exploredTiles[z][x][y] = state;
    }
  }
}

export default Map;