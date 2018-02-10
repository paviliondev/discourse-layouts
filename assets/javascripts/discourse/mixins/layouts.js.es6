import { default as computed } from 'ember-addons/ember-computed-decorators';
import { toggleSidebar } from '../lib/display';

export default Ember.Mixin.create({
  path: Ember.computed.alias('application.currentPath'),
  mobileTogglesEnabled: true,

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

  @computed('leftSidebarEnabled', 'mobileTogglesEnabled')
  showLeftToggle(sidebarEnabled, togglesEnabled) {
    const isMobile = this.get('site.mobileView');
    return isMobile && sidebarEnabled && togglesEnabled;
  },

  @computed('rightSidebarEnabled', 'mobileTogglesEnabled')
  showRightToggle(sidebarEnabled, togglesEnabled) {
    const isMobile = this.get('site.mobileView');
    return isMobile && sidebarEnabled && togglesEnabled;
  },

  actions: {
    toggleSidebar(side) {
      toggleSidebar(side);
    }
  }
});
