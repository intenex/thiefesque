import { Mixins } from './entity';

export const PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Mixins.Moveable, Mixins.PlayerActor]
};