import Item from './item';
import Repository from './repository';
import ItemMixins from './itemmixins';

const ItemRepository = new Repository('items', Item);

ItemRepository.define('corpse', {
  name: 'corpse',
  character: '%',
  foodValue: 75,
  consumptions: 1,
  mixins: [ItemMixins.Edible]
}, {
  disableRandomCreation: true
});

ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red',
  foodValue: 50,
  mixins: [ItemMixins.Edible]
});

ItemRepository.define('melon', {
  name: 'melon',
  character: '%',
  foreground: 'green',
  foodValue: 35,
  consumptions: 4,
  mixins: [ItemMixins.Edible]
});

// right you can export default classes and functions directly but not variables those you have to do separately here make sure this is true look into it more
export default ItemRepository;