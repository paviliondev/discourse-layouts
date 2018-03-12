import { default as computed, on } from 'ember-addons/ember-computed-decorators';
import { mainStyle, responsiveSidebarWidth } from '../lib/display';
import { settingEnabled } from '../lib/settings';

export default Ember.Mixin.create({
  application: Ember.inject.controller('application'),
  path: Ember.computed.alias('application.currentPath'),
  mobileTogglesEnabled: true,
  responsiveView: false,
  leftSidebarVisible: false,
  rightSidebarVisible: false,

  @computed('path')
  leftSidebarEnabled() {
    return settingEnabled('layouts_sidebar_left_enabled', this.get('category'), this.get('path'));
  },

  @computed('path')
  rightSidebarEnabled() {
    return settingEnabled('layouts_sidebar_right_enabled', this.get('category'), this.get('path'));
  },

  @on('init')
  setupMixin() {
    Ember.run.scheduleOnce('afterRender', () => {
      this.handleResize();
      $(window).on('resize', Ember.run.bind(this, this.handleResize));
    });
    this.appEvents.on('sidebar:toggle', (side) => this.toggleProperty(`${side}SidebarVisible`));
  },

  @on('willDestroy')
  teardownMixin() {
    $(window).off('resize', Ember.run.bind(this, this.handleResize));
    this.appEvents.off('sidebar:toggle', (side) => this.toggleProperty(`${side}SidebarVisible`));
  },

  handleResize() {
    const windowWidth = $(window).width();
    const settings = this.siteSettings;
    const leftSidebarEnabled = this.get('leftSidebarEnabled');
    const rightSidebarEnabled = this.get('rightSidebarEnabled');
    let threshold = settings.layouts_sidebar_main_content_threshold + 5;

    if (leftSidebarEnabled) {
      threshold += settings.layouts_sidebar_left_width + 15;
    }
    if (rightSidebarEnabled) {
      threshold += settings.layouts_sidebar_right_width + 15;
    }

    this.set("responsiveView", windowWidth < Number(threshold));
  },

  @computed('responsiveView')
  isResponsive(responsiveView) {
    const mobileView = this.get('site.mobileView');
    return mobileView || responsiveView;
  },

  @computed('path', 'loading', 'editingSidebars', 'isResponsive')
  mainClasses(path, loading, editing, isResponsive) {
    const left = this.get('leftSidebarEnabled');
    const right = this.get('rightSidebarEnabled');
    let p = path.split('.');
    let classes = `${p[0]} ${p[1].split(/(?=[A-Z])/)[0]}`;

    if (loading) return classes + ' loading';
    if (left || right) {
      classes += ' has-sidebars';
    } else {
      classes += ' no-sidebars';
    }
    if (left) classes += ' left-sidebar';
    if (right) classes += ' right-sidebar';
    if (isResponsive) classes += ' is-responsive';
    if (this.get('navigationDisabled')) classes += ' navigation-disabled';
    if (this.get('headerDisabled')) classes += ' header-disabled';
    if (this.get('navMenuEnabled')) classes += ' nav-menu-enabled';
    if (editing) classes += ' editing';

    return classes;
  },

  @computed('isResponsive', 'leftSidebarVisible')
  leftClasses(isResponsive, visible) {
    let classes = '';
    if (isResponsive) {
      classes += 'is-responsive';
      if (visible) classes += ' open';
    }
    return classes;
  },

  @computed('isResponsive', 'rightSidebarVisible')
  rightClasses(isResponsive, visible) {
    let classes = '';
    if (isResponsive) {
      classes += 'is-responsive';
      if (visible) classes += ' open';
    }
    return classes;
  },

  @computed('path', 'isResponsive', 'leftSidebarVisible')
  leftStyle(path, isResponsive, visible) {
    let width = this.siteSettings.layouts_sidebar_left_width;
    if (isResponsive) width = responsiveSidebarWidth('left');
    let string = `width: ${width}px;`;
    if (isResponsive) {
      const left = visible ? '0' : `-${width}`;
      string += ` left: ${left}px;`;
    }
    return Ember.String.htmlSafe(string);
  },

  @computed('path', 'isResponsive', 'rightSidebarVisible')
  rightStyle(path, isResponsive, visible) {
    let width = this.siteSettings.layouts_sidebar_right_width;
    if (isResponsive) width = responsiveSidebarWidth('right');
    let string = `width: ${width}px;`;
    if (isResponsive) {
      const right = visible ? '0' : `-${width}`;
      string += ` right: ${right}px;`;
    }
    return Ember.String.htmlSafe(string);
  },

  @computed('path', 'isTopic')
  mainStyle(path, isTopic) {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return;

    const left = this.get('leftSidebarEnabled');
    const right = this.get('rightSidebarEnabled');
    return Ember.String.htmlSafe(mainStyle(left, right, isTopic));
  },

  @computed('leftSidebarEnabled', 'mobileTogglesEnabled', 'isResponsive', 'rightSidebarVisible')
  showLeftToggle(sidebarEnabled, togglesEnabled, isResponsive, rightSidebarVisible) {
    return isResponsive && sidebarEnabled && togglesEnabled && !rightSidebarVisible;
  },

  @computed('rightSidebarEnabled', 'mobileTogglesEnabled', 'isResponsive', 'leftSidebarVisible')
  showRightToggle(sidebarEnabled, togglesEnabled, isResponsive, leftSidebarVisible) {
    return isResponsive && sidebarEnabled && togglesEnabled && !leftSidebarVisible;
  },

  @computed('leftSidebarVisible')
  toggleSidebarLeftIcon(visible) {
    return visible ? 'chevron-left' : 'chevron-right';
  },

  @computed('rightSidebarVisible')
  toggleSidebarRightIcon(visible) {
    return visible ? 'chevron-right' : 'chevron-left';
  },

  actions: {
    toggleSidebar(side) {
      this.toggleProperty(`${side}SidebarVisible`);
    }
  }
});
