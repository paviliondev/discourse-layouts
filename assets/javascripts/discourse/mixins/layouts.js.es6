import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Mixin.create({
  path: Ember.computed.alias('application.currentPath'),

  @computed('path')
  leftStyle() {
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
  },

  @computed('path')
  rightStyle() {
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
  }
})
