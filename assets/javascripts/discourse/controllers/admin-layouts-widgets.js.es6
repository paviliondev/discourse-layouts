import { ajax } from 'discourse/lib/ajax';

export default Ember.Controller.extend({
  actions: {
    clear(name) {
      ajax('/admin/layouts/clear-widget', { type: 'PUT', data: { name } }).then(() => {
        this.set('widgets', this.get('widgets').filter((w) => w.name !== name));
      })
    }
  }
})
