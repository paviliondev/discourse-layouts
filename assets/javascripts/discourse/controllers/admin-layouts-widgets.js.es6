import { ajax } from 'discourse/lib/ajax';
import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({
  positionOptions: ['left', 'right'],

  @computed('widgets')
  orderOptions(widgets) {
    const numberOfWidgets = widgets.length;
    let numbers = Array.from(Array(numberOfWidgets).keys());
    let orderOptions = ['start', 'end'];
    orderOptions.push(...numbers);
    return orderOptions;
  },

  actions: {
    clear(name) {
      ajax('/admin/layouts/clear-widget', { type: 'PUT', data: { name } }).then(() => {
        this.set('widgets', this.get('widgets').filter((w) => w.name !== name));
      })
    }
  }
})
