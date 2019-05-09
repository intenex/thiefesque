import Item from './item';
import Repository from './repository';

// interesting syntax don't have to specify a let or a const variable declaration here? So strange
const ItemRepository = new Repository('items', Item);

ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red'
});

ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foregroudn: 'white'
});

export default ItemRepository;