import { default as computed } from 'ember-addons/ember-computed-decorators';
import { toggleSidebar } from '../lib/display';

export default Ember.Mixin.create({
  path: Ember.computed.alias('application.currentPath'),

  @computed('path')
  leftStyle() {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return '';
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
  },

  @computed('path')
  rightStyle() {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return '';
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
  },

  actions: {
    toggleSidebar(side) {
      toggleSidebar(side);
    }
  }
});
