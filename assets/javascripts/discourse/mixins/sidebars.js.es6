import { default as discourseComputed, on, observes } from 'discourse-common/utils/decorators';
import { mainStyle, responsiveSidebarWidth } from '../lib/display';
import { settingEnabled } from '../lib/settings';
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  router: service(),
  path: alias("router._router.currentPath"),
  mobileTogglesEnabled: true,
  responsiveView: false,
  leftSidebarVisible: false,
  rightSidebarVisible: false,
  leftHasWidgets: true,
  rightHasWidgets: true,
  customSidebarProps: {},

  @observes('path')
  resetHasWidgets() {
    this.setProperties({
      leftHasWidgets: true,
      rightHasWidgets: true
    })
  },

  @discourseComputed('path', 'leftHasWidgets')
  leftSidebarEnabled(path, hasWidgets) {
    const hideIfNoWidgets = Discourse.SiteSettings.layouts_hide_sidebars_if_empty;
    if (hideIfNoWidgets && !hasWidgets) return false;
    return settingEnabled('layouts_sidebar_left_enabled', this.get('category'), path);
  },

  @discourseComputed('path', 'rightHasWidgets')
  rightSidebarEnabled(path, hasWidgets) {
    const hideIfNoWidgets = Discourse.SiteSettings.layouts_hide_sidebars_if_empty;
    if (hideIfNoWidgets && !hasWidgets) return false;
    return settingEnabled('layouts_sidebar_right_enabled', this.get('category'), path);
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

  @discourseComputed('responsiveView')
  isResponsive(responsiveView) {
    const mobileView = this.get('site.mobileView');
    return mobileView || responsiveView;
  },

  @discourseComputed('path', 'loading', 'editingSidebars', 'isResponsive', 'leftSidebarEnabled', 'rightSidebarEnabled', 'forceSidebars')
  mainClasses(path, loading, editing, isResponsive, left, right, force) {
    let p = path.split('.');
    let classes = `${p[0]} ${p[1].split(/(?=[A-Z])/)[0]}`;

    if ((left || right) || force) {
      classes += ' has-sidebars';
    } else {
      classes += ' no-sidebars';
    }
    if (left) classes += ' left-sidebar';
    if (right) classes += ' right-sidebar';
    if (isResponsive) classes += ' is-responsive';

    if (loading) return classes + ' loading';

    if (this.get('navigationDisabled')) classes += ' navigation-disabled';
    if (this.get('headerDisabled')) classes += ' header-disabled';
    if (this.get('navMenuEnabled')) classes += ' nav-menu-enabled';
    if (editing) classes += ' editing';

    return classes;
  },

  @discourseComputed('isResponsive', 'leftSidebarVisible')
  leftClasses(isResponsive, visible) {
    let classes = '';
    if (isResponsive) {
      classes += 'is-responsive';
      if (visible) classes += ' open';
    }
    return classes;
  },

  @discourseComputed('isResponsive', 'rightSidebarVisible')
  rightClasses(isResponsive, visible) {
    let classes = '';
    if (isResponsive) {
      classes += 'is-responsive';
      if (visible) classes += ' open';
    }
    return classes;
  },

  @discourseComputed('path', 'isResponsive', 'leftSidebarVisible')
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

  @discourseComputed('path', 'isResponsive', 'rightSidebarVisible')
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

  @discourseComputed('path', 'isTopic', 'leftSidebarEnabled', 'rightSidebarEnabled')
  mainStyle(path, isTopic, left, right) {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return;
    return Ember.String.htmlSafe(mainStyle(left, right, isTopic));
  },

  @discourseComputed('leftSidebarEnabled', 'mobileTogglesEnabled', 'isResponsive', 'eitherSidebarVisible')
  showSidebarToggles(sidebarEnabled, togglesEnabled, isResponsive, eitherSidebarVisible) {
    return isResponsive && sidebarEnabled && togglesEnabled && !eitherSidebarVisible;
  },

  eitherSidebarVisible: Ember.computed.or('leftSidebarVisible', 'rightSidebarVisible'),

  actions: {
    toggleSidebar(side) {
      this.toggleProperty(`${side}SidebarVisible`);
    },

    noWidgets(side) {
      this.set(`${side}HasWidgets`, false);
    }
  }
});
