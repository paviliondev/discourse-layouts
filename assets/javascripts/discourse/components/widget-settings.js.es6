import { default as computed } from 'ember-addons/ember-computed-decorators';
import BufferedContent from 'discourse/mixins/buffered-content';
import { ajax } from 'discourse/lib/ajax';

export default Ember.Component.extend(BufferedContent, {
  content: Ember.computed.alias('widget'),

  @computed('buffered.position', 'buffered.order')
  dirty(position, order) {
    const widget = this.get('widget');
    return position != widget.position || order != widget.order;
  },

  actions: {
    save() {
      const buffer = this.get('buffered.buffer');
      const widget = JSON.parse(JSON.stringify(this.get('widget')));
      let data = Object.assign(widget, buffer);

      this.set('saving', true);
      ajax('/admin/layouts/save-widget', { type: 'PUT', data }).then((result) => {
        this.setProperties({
          'widget': result.widget,
          'saving': false
        })
      }).catch(() => {
        this.setProperties({
          'buffered.buffer': this.get('widget'),
          'saving': false
        })
      })
    },

    clear() {
      this.sendAction('clear', this.get('widget')['name']);
    }
  }
})
