import { Mixins } from './entity';

const Entities = {};

Entities.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Mixins.Moveable, Mixins.PlayerActor]
};



export default Entities; // do this when you're not exporting the class along with specific defined object instances of that class but rather just one collection of things perhaps