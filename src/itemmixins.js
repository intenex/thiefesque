import Item from './item';

const ItemMixins = {};

ItemMixins.Edible = {
  name: 'Edible',
  init(template) {
    // num points to add to fullness
    this.foodValue = template.foodValue || 5;
    // num times item can be consumed
    this.maxConsumptions = template.consumptions || 1;
    this.remainingConsumptions = this.maxConsumptions;
  },
  eat(entity) {
    if (entity.hasMixin('FoodConsumer')) {
      if (this.hasRemainingConsumptions()) {
        entity.modifyFullnessBy(this.foodValue);
        this.remainingConsumptions--;
      }
    }
  },
  hasRemainingConsumptions() {
    return this.remainingConsumptions > 0; // the way we're using this doesn't actually have to do this since 0 is falsey in JS
  },
  describe() {
    if (this.maxConsumptions != this.remainingConsumptions) {
      return `partly eaten ${Item.prototype.describe.call(this)}`;
    } else {
      return this.name;
    }
  }
};

export default ItemMixins;