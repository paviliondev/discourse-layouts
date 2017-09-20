import { default as computed } from 'ember-addons/ember-computed-decorators';
import { getContentWidth } from '../lib/display';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  mainContent: 'tags',

  @computed('application.currentPath')
  leftSidebarEnabled() {
    return Discourse.SiteSettings.layouts_sidebar_left_enabled.split('|').indexOf('tags') > -1;
  },

  @computed('application.currentPath')
  rightSidebarEnabled() {
    return Discourse.SiteSettings.layouts_sidebar_right_enabled.split('|').indexOf('tags') > -1;
  },

  @computed('application.currentPath')
  mainStyle() {
    const left = this.get('leftSidebarEnabled');
    const right = this.get('rightSidebarEnabled');
    return Ember.String.htmlSafe(`width: ${getContentWidth(left, right)};`);
  },

  @computed('application.currentPath')
  leftStyle() {
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
  },

  @computed('application.currentPath')
  rightStyle() {
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
  },

  @computed('application.currentPath', 'loading')
  mainClasses(path, loading) {
    const left = this.get('leftSidebarEnabled');
    const right = this.get('rightSidebarEnabled');
    let classes = 'tags';

    if (loading) {
      return classes + ' loading';
    }
    if (left || right) {
      classes += ' has-sidebars';
    }
    if (left) {
      classes += ' left-sidebar';
    }
    if (right) {
      classes += ' right-sidebar';
    }
    if (this.get('navigationDisabled')) {
      classes += ' navigation-disabled';
    }
    if (this.get('headerDisabled')) {
      classes += ' header-disabled';
    }
    if (this.get('navMenuEnabled')) {
      classes += ' nav-menu-enabled';
    }
    return classes;
  }
});
