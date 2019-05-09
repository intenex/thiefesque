import * as ROT from 'rot-js';
import * as TILES from './tile';

// makes all the tiles for all the levels in the whole map
export default class Builder {
  constructor(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.tiles = [];
    this.allUpstairPos = []; // keep a track of all the upstair and downstair pos in each floor so you can map them to each other when moving between levels
    this.allDownstairPos = [];
    // instantiate the arrays to be multi-dimensional
    for (let z = 0; z < depth; z++) {
      // fill out each level
      const results = this.generateLevel();
      const map = results[0];
      const upstairPos = results[1];
      const downstairPos = results[2];
      this.tiles.push(map);
      this.allUpstairPos.push(upstairPos);
      this.allDownstairPos.push(downstairPos);
    }
  }

  getTiles() {
    return this.tiles;
  }

  getAllUpstairPos() {
    return this.allUpstairPos;
  }

  getAllDownstairPos() {
    return this.allDownstairPos;
  }

  getDepth() {
    return this.depth;
  }

  getWidth() {
    return this.width;
  }

  getHeight() { 
    return this.height;
  }

  generateLevel() {
    // create empty map, better way of doing it hmm see if this is necessary at all
    const map = [];
    const floorTiles = [];
    const upstairPos = [];
    const downstairPos = [];
    for (let w = 0; w < this.width; w++) {
      map.push([]);
    }
    // Setup the map generator, using Map.Digger for the Tyrant algo vs the Map.Cellular option used by the tutorial as this one leads to more natural cavelike patterns versus man-made dungeons and also possibly leads to dead ends which are not great
    const generator = new ROT.Map.Digger(this.width, this.height);
    const generatorCB = (x, y, v) => { // making this an arrow function so you don't have to bind the scope here it automatically should have access to the scope here love it
      if (v) { // if v is true, meaning 1, then this is a wall tile. The Map generators return 1 and 0 generally to distinguish these two characteristics
        map[x][y] = TILES.wallTile;
      } else { // if v is false, meaning 0 (since 0 equals false in JS lol), then this is a floor tile
        map[x][y] = TILES.floorTile;
        floorTiles.push([x, y]);
      }
    };
    generator.create(generatorCB);
    // create stairs up and stairs down, three per level of each
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * floorTiles.length);
      const stairPos = floorTiles[idx]; // since Math.random() is exclusive of 1 this will always get a random tile in the list from 0 to length-1 which is exactly what you want
      floorTiles.splice(idx, 1); // remove that tile from the floor tiles list so you don't accidentally go over it again, though this isn't necessary - if you don't do this odds are exceedingly small but possible that you'll have less than 3 total stairs but you should still have at least 1 stair. The real issue is that you could theoretically in the most unlucky case have 3 downstairs that replace all the upstairs somehow lol and that would be gamebreaking
      map[stairPos[0]][stairPos[1]] = TILES.stairsUpTile; // change that given tile position to a stairsUpTile hell yeah
      upstairPos.push(stairPos);
    }
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * floorTiles.length);
      const stairPos = floorTiles[idx];
      floorTiles.splice(idx, 1);
      map[stairPos[0]][stairPos[1]] = TILES.stairsDownTile;
      downstairPos.push(stairPos);
    }
    return [map, upstairPos, downstairPos];
  }
}