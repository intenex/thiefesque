import Map from './../map';

export default class BossCavern extends Map {
  constructor() {
    super(this.generateTiles(80, 40));
  }
}