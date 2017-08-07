import { default as computed } from 'ember-addons/ember-computed-decorators';
import BufferedContent from 'discourse/mixins/buffered-content';
import { ajax } from 'discourse/lib/ajax';

export default Ember.Component.extend(BufferedContent, {
  content: Ember.computed.alias('widget'),
  pinOptions: ['top', 'bottom'],
  positionOptions: ['left', 'right'],

  @computed('buffered.position', 'buffered.pinned')
  dirty(position, pinned) {
    const widget = this.get('widget');
    return position != widget.position || pinned != widget.pinned;
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
    }
  }
})
