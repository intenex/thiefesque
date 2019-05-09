import Item from './item';
import Repository from './repository';

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

// right you can export default classes and functions directly but not variables those you have to do separately here make sure this is true look into it more
export default ItemRepository;