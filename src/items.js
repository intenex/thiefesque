import Item from './item';
import Repository from './repository';

const ItemRepository = new Repository('items', Item);

export default ItemRepository;