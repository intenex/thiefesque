import Map from './../map'; // from the current directory go up a directory then find map.js, can you just do '../map'? look into it later
import { EntityRepository } from './../entities';
import ItemRepository from './../items';
import * as TILES from './..tiles';

export default class Dungeon extends Map {
  constructor(tiles, player, upstairPos, downstairPos) {
    super(tiles, upstairPos, downstairPos);
    // add the player
    this.addEntityAtRandomPosition(player, this.currentZ);
    // add random entities and items to each floor of the dungeon
    for (let z = 0; z < this.depth; z++) {
      // add 25 random monsters on every level
      for (let i = 0; i < 25; i++) {
        // randomly select a template for a monster
        const entity = EntityRepository.createRandom();
        this.addEntityAtRandomPosition(entity, z);
        // level up the entity based on the floor of the dungeon so great
        if (entity.hasMixin('ExperienceGainer')) {
          for (let level = 0; level < z; level++) {
            entity.giveExperience(entity.getNextLevelExperience() - entity.getExperience());
          }
        }
      }
      // ten random items per floor
      for (let i = 0; i < 10; i++) {
        // add a random item
        this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
      }
    }
    // add weapons and armor to the map in random positions, one of each unique to the entire dungeon across all levels lol
    const templates = ['dagger', 'sword', 'staff', 'tunic', 'chainmail', 'platemail'];
    for (let i = 0; i < templates.length; i++) {
      this.addItemAtRandomPosition(ItemRepository.create(templates[i]),
        Math.floor(this.depth * Math.random()));
    }
    // add final boss hole here lol
    const holePosition = this.getRandomFloorPosition(this.depth - 1);
    this.tiles[this.depth - 1][holePosition.x][holePosition.y] = TILES.holeTile;
  }
}