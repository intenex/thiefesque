import Item from './item';
import Repository from './repository';
import ItemMixins from './itemmixins';

const ItemRepository = new Repository('items', Item);

// food

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

// weapons

ItemRepository.define('dagger', {
  name: 'dagger',
  character: ')',
  foreground: 'gray',
  attackValue: 5,
  wieldable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

ItemRepository.define('sword', {
  name: 'sword',
  character: ')',
  foreground: 'white',
  attackValue: 10,
  wieldable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

ItemRepository.define('staff', {
  name: 'staff',
  character: ')',
  foreground: 'yellow',
  attackValue: 5,
  defenseValue: 3,
  wieldable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

// wearables

// Wearables
ItemRepository.define('tunic', {
  name: 'tunic',
  character: '[',
  foreground: 'green',
  defenseValue: 2,
  wearable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

ItemRepository.define('chainmail', {
  name: 'chainmail',
  character: '[',
  foreground: 'white',
  defenseValue: 4,
  wearable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

ItemRepository.define('platemail', {
  name: 'platemail',
  character: '[',
  foreground: 'aliceblue',
  defenseValue: 6,
  wearable: true,
  mixins: [ItemMixins.Equippable]
}, {
  disableRandomCreation: true
});

// right you can export default classes and functions directly but not variables those you have to do separately here make sure this is true look into it more
export default ItemRepository;