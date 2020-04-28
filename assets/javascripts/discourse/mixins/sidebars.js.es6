import { default as discourseComputed, on, observes } from 'discourse-common/utils/decorators';
import { mainStyle, responsiveSidebarWidth } from '../lib/layouts-display';
import { settingEnabled } from '../lib/layouts-settings';
import { inject as service } from "@ember/service";
import { alias, or, not, and } from "@ember/object/computed";
import Mixin from "@ember/object/mixin";
import { scheduleOnce, bind } from "@ember/runloop";
import { htmlSafe } from "@ember/template";

const sidebarPadding = 20;
const mainLeftOffset = Discourse.SiteSettings.layouts_sidebar_left_width + sidebarPadding;
const mainRightOffset = Discourse.SiteSettings.layouts_sidebar_right_width + sidebarPadding;

export default Mixin.create({
  router: service(),
  path: alias("router._router.currentPath"),
  mobileTogglesEnabled: true,
  responsiveView: false,
  leftSidebarVisible: false,
  rightSidebarVisible: false,
  eitherSidebarVisible: or('leftSidebarVisible', 'rightSidebarVisible'),
  neitherSidebarVisible: not('eitherSidebarVisible'),
  showSidebarToggles: and('isResponsive', 'mobileTogglesEnabled', 'neitherSidebarVisible'),
  showLeftSidebarToggle: and('showSidebarToggles', 'leftSidebarEnabled'),
  showRightSidebarToggle: and('showSidebarToggles', 'rightSidebarEnabled'),
  leftHasWidgets: true,
  rightHasWidgets: true,
  customSidebarProps: {},
  hideSidebarsIfEmpty: alias('siteSettings.layouts_hide_sidebars_if_empty'),

  @discourseComputed('path', 'leftHasWidgets', 'hideSidebarsIfEmpty')
  leftSidebarEnabled(path, leftHasWidgets, hideSidebarsIfEmpty) {
    if (hideSidebarsIfEmpty && !leftHasWidgets) return false;
    return settingEnabled('layouts_sidebar_left_enabled', this.category, path);
  },

  @discourseComputed('path', 'rightHasWidgets', 'hideSidebarsIfEmpty')
  rightSidebarEnabled(path, rightHasWidgets, hideSidebarsIfEmpty) {
    if (hideSidebarsIfEmpty && !rightHasWidgets) return false;
    return settingEnabled('layouts_sidebar_right_enabled', this.category, path);
  },

  @on('init')
  setupMixin() {
    scheduleOnce('afterRender', () => {
      this.handleResize();
      $(window).on('resize', bind(this, this.handleResize));
      const root = document.documentElement;
      root.style.setProperty('--mainLeftOffset', `${mainLeftOffset}px`);
      root.style.setProperty('--mainRightOffset', `${mainRightOffset}px`);
    });
    
    this.appEvents.on('sidebar:toggle', (side) => {
      this.toggleProperty(`${side}SidebarVisible`)
    });
  },

  @on('willDestroy')
  teardownMixin() {
    $(window).off('resize', bind(this, this.handleResize));
    
    this.appEvents.off('sidebar:toggle', (side) => {
      this.toggleProperty(`${side}SidebarVisible`)
    });
  },
  
  @observes('path')
  resetHasWidgets() {
    this.setProperties({
      leftHasWidgets: true,
      rightHasWidgets: true
    })
  },

  handleResize() {
    const windowWidth = $(window).width();
    const settings = this.siteSettings;
    const mainContentThreshold = settings.layouts_sidebar_main_content_threshold;
    const leftSidebarEnabled = this.leftSidebarEnabled;
    const rightSidebarEnabled = this.rightSidebarEnabled;
    
    let threshold = mainContentThreshold + 5;
    if (leftSidebarEnabled) {
      threshold += mainLeftOffset;
    }
    if (rightSidebarEnabled) {
      threshold += mainRightOffset;
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
  
  @discourseComputed('path', 'leftSidebarEnabled', 'rightSidebarEnabled')
  mainStyle(path, leftSidebarEnabled, rightSidebarEnabled) {
    if (this.site.mobileView) return;
    let offset = 0;
    let style = '';
    if (leftSidebarEnabled) {
      offset += mainLeftOffset;
    }
    if (rightSidebarEnabled) {
      offset += mainRightOffset;
    }
    style += `width: ${offset > 0 ? `calc(100% - ${offset}px)` : '100%'}`;
    return htmlSafe(style);
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
    return htmlSafe(string);
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
    return htmlSafe(string);
  },
  
  actions: {
    toggleSidebar(side) {
      this.toggleProperty(`${side}SidebarVisible`);
    },

    noWidgets(side) {
      this.set(`${side}HasWidgets`, false);
    }
  }
});
