import { Moveable } from './entity';

export const PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Moveable]
};