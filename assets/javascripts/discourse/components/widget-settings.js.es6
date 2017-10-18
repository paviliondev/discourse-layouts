import { ajax } from 'discourse/lib/ajax';

export default Ember.Component.extend({
  didInsertElement() {
    this.set('existingWidget', this.get('widget'));
  },

  actions: {
    save() {
      const widget = JSON.parse(JSON.stringify(this.get('widget')));
      this.set('saving', true);
      ajax('/admin/layouts/save-widget', { type: 'PUT', data: widget }).then((result) => {
        this.setProperties({
          'widget': result.widget,
          'saving': false
        });
      }).catch(() => {
        this.setProperties({
          'widget': this.get('existingWidget'),
          'saving': false
        });
      });
    },

    clear() {
      this.sendAction('clear', this.get('widget')['name']);
    }
  }
});
