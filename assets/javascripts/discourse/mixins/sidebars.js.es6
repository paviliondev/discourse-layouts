import { default as discourseComputed, on, observes } from 'discourse-common/utils/decorators';
import { mainStyle } from '../lib/layouts-display';
import { settingEnabled } from '../lib/layouts-settings';
import { inject as service } from "@ember/service";
import { alias, or, not, and, notEmpty } from "@ember/object/computed";
import Mixin from "@ember/object/mixin";
import { scheduleOnce, bind, later } from "@ember/runloop";
import { htmlSafe } from "@ember/template";
import { iconHTML } from "discourse-common/lib/icon-library";
import DiscourseURL from "discourse/lib/url";

export default Mixin.create({
  router: service(),
  path: alias("router._router.currentPath"),
  responsiveView: false,
  leftSidebarVisible: false,
  rightSidebarVisible: false,
  eitherSidebarVisible: or('leftSidebarVisible', 'rightSidebarVisible'),
  neitherSidebarVisible: not('eitherSidebarVisible'),
  showResponsiveMenu: and('isResponsive', 'responsiveMenuItems.length'),
  showLeftToggle: and('showSidebarToggles', 'leftSidebarEnabled'),
  showRightToggle: and('showSidebarToggles', 'rightSidebarEnabled'),
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
    const siteSettings = this.siteSettings;
    const sidebarPadding = 20;
    const mainLeftOffset = siteSettings.layouts_sidebar_left_width + sidebarPadding;
    const mainRightOffset = siteSettings.layouts_sidebar_right_width + sidebarPadding;
    
    scheduleOnce('afterRender', () => {
      this.handleResize();
      $(window).on('resize', bind(this, this.handleResize));
      const root = document.documentElement;
      root.style.setProperty('--mainLeftOffset', `${this.mainLeftOffset}px`);
      root.style.setProperty('--mainRightOffset', `${this.mainRightOffset}px`);
    });
    
    this.appEvents.on('sidebar:toggle', (side) => {
      const $sidebarCloak = $(".sidebar-cloak");
      $sidebarCloak.css("opacity", 0);
      $sidebarCloak.hide();
      this.toggleProperty(`${side}SidebarVisible`);
    });
    
    this.setProperties({
      mainLeftOffset,
      mainRightOffset
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
    const mainLeftOffset = this.mainLeftOffset;
    const mainRightOffset = this.mainRightOffset;
    
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
    const mainLeftOffset = this.mainLeftOffset;
    const mainRightOffset = this.mainRightOffset;
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
    let string;
    if (isResponsive) {
      string = `width: 100vw; transform: translateX(${visible?'0':'-100vw'});`
    } else {
      string = `width: ${this.siteSettings.layouts_sidebar_left_width}px;`;
    }
    return htmlSafe(string);
  },

  @discourseComputed('path', 'isResponsive', 'rightSidebarVisible')
  rightStyle(path, isResponsive, visible) {
    let string;
    if (isResponsive) {
      string = `width: 100vw; transform: translateX(${visible?'0':'100vw'});`
    } else {
      string = `width: ${this.siteSettings.layouts_sidebar_right_width}px;`;
    }
    return htmlSafe(string);
  },
  
  @discourseComputed
  responsiveMenuItems() {
    const inputs = this.siteSettings.layouts_mobile_menu.split('|');
    return inputs.reduce((items, input) => {
      let firstSeperator = input.indexOf("~~");
      let lastSeperator = input.lastIndexOf("~~");
      let type = input.substring(0, firstSeperator), icon, url;
      
      if (type === 'link') {
        icon = input.substring(firstSeperator + 2, lastSeperator);
        url = input.substring(lastSeperator + 2, input.length);
      } else {
        icon = input.substring(firstSeperator + 2, input.length);
      }
      
      let iconClass = this.menuItemClass(type);
      let iconHtml = this.menuItemIconHtml(icon);
            
      if (iconHtml && iconClass) {
        items.push({
          icon: iconHtml,
          class: iconClass,
          action: type === 'link' ? 'goToLink' : 'toggleSidebar',
          actionParam: type === 'link' ? url : type
        });
      }
      
      return items;
    }, []);
  },
  
  menuItemClass(type) {
    if (['left', 'right'].indexOf(type) > -1) {
      return `responsive-toggle ${type}`;
    } else if (type === 'link') {
      return 'responsive-link';
    } else {
      return null;
    }
  },
  
  menuItemIconHtml(input) {
    const setupData = document.getElementById("data-discourse-setup").dataset;
    const iconList = setupData.svgIconList;
    
    if (iconList[input]) {
      return iconHTML(input).htmlSafe();
    } else {
      try {
        let url = new URL(input);
        return htmlSafe(`<img src=${url.href} class="image-icon">`);
      } catch (_) {
        return null;  
      }
    }
  },
  
  actions: {
    toggleSidebar(side) {
      this.toggleProperty(`${side}SidebarVisible`);
      later(() => {
        const $sidebarCloak = $(".sidebar-cloak");
        $sidebarCloak.css("opacity", 0.5);
        $sidebarCloak.show();
      });
    },

    noWidgets(side) {
      this.set(`${side}HasWidgets`, false);
    },
    
    goToLink(link) {
      DiscourseURL.routeTo(link);
    }
  }
});
