import Map from '../map';
import BossBuilder from '../bosscavernbuilder';
import { EntityRepository } from '../entities';

export default class BossCavern extends Map {
  constructor() {
    super(BossBuilder.prototype.generateTiles(80, 40));
    this.addEntityAtRandomPosition(EntityRepository.create('giant zombie'), 0);
  }
}