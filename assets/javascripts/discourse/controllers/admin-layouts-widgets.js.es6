import { ajax } from 'discourse/lib/ajax';
import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({
  positionOptions: ['left', 'right'],

  @computed('widgets')
  orderOptions(widgets) {
    let orderOptions = ['start', 'end'];
    const numberOfWidgets = widgets.length;
    if (numberOfWidgets > 0) {
      for (let i=1; i<=numberOfWidgets; i++) {
        orderOptions.push(i.toString());
      }
    }
    return orderOptions;
  },

  actions: {
    clear(name) {
      ajax('/admin/layouts/clear-widget', { type: 'PUT', data: { name } }).then(() => {
        this.set('widgets', this.get('widgets').filter((w) => w.name !== name));
      });
    }
  }
});
