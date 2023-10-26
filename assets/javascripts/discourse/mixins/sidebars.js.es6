import { computed } from "@ember/object";
import { alias, and, equal, not, or } from "@ember/object/computed";
import Mixin from "@ember/object/mixin";
import { bind, debounce, scheduleOnce } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import { iconHTML } from "discourse-common/lib/icon-library";
import {
  default as discourseComputed,
  observes,
  on,
} from "discourse-common/utils/decorators";
import DiscourseURL from "discourse/lib/url";
import { layoutsNamespace, normalizeContext } from "../lib/layouts";

function hasWidgets(widgets, widgetsSet) {
  return !widgetsSet || (widgets && widgets.length > 0);
}

export default Mixin.create({
  router: service(),
  path: alias("router._router.currentPath"),
  mobileView: false,
  tabletView: false,
  showMobileMenu: and("mobileView", "mobileMenuItems.length"),
  showLeftToggle: and("showSidebarToggles", "leftSidebarEnabled"),
  showRightToggle: and("showSidebarToggles", "rightSidebarEnabled"),
  customSidebarProps: {},
  eitherSidebarVisible: or("leftSidebarVisible", "rightSidebarVisible"),
  neitherSidebarVisible: not("eitherSidebarVisible"),
  leftSidebarEnabled: computed("leftWidgets", "widgetsSet", function () {
    return hasWidgets(this.leftWidgets, this.widgetsSet);
  }),
  rightSidebarEnabled: computed(
    "rightWidgets",
    "leftFull",
    "widgetsSet",
    function () {
      return !this.leftFull && hasWidgets(this.rightWidgets, this.widgetsSet);
    }
  ),
  hasRightSidebar: and("rightSidebarEnabled", "rightSidebarVisible"),
  hasLeftSidebar: and("leftSidebarEnabled", "leftSidebarVisible"),
  widgetsSet: or("leftWidgetsSet", "rightWidgetsSet"),
  leftFull: equal("siteSettings.layouts_sidebar_left_position", "full"),

  @discourseComputed("layouts_context", "mobileView")
  canHideRightSidebar(context, mobileView) {
    return this.canHide(context, "right", mobileView);
  },

  @discourseComputed("layouts_context", "mobileView")
  canHideLeftSidebar(context, mobileView) {
    return this.canHide(context, "left", mobileView);
  },

  canHide(context, side, mobileView) {
    return (
      !mobileView &&
      this.siteSettings[`layouts_sidebar_${side}_can_hide`]
        .split("|")
        .map(normalizeContext)
        .includes(normalizeContext(context))
    );
  },

  @discourseComputed("rightSidebarVisible")
  toggleRightSidebarIcon(visible) {
    const settings = this.siteSettings;
    return visible
      ? settings.layouts_sidebar_hide_icon
      : settings.layouts_sidebar_show_icon;
  },

  @discourseComputed("leftSidebarVisible")
  toggleLeftSidebarIcon(visible) {
    const settings = this.siteSettings;
    return visible
      ? settings.layouts_sidebar_hide_icon
      : settings.layouts_sidebar_show_icon;
  },

  @on("init")
  setupMixin() {
    const settings = this.siteSettings;
    const sidebarPadding = 20;
    const mainLeftOffset = settings.layouts_sidebar_left_width + sidebarPadding;
    const mainRightOffset =
      settings.layouts_sidebar_right_width + sidebarPadding;

    scheduleOnce("afterRender", () => {
      this.handleWindowResize();
      $(window).on("resize", () =>
        debounce(this, this.handleWindowResize, 100)
      );

      const root = document.documentElement;
      root.style.setProperty("--mainLeftOffset", `${this.mainLeftOffset}px`);
      root.style.setProperty("--mainRightOffset", `${this.mainRightOffset}px`);
    });
    this.appEvents.on("sidebar:toggle", this, this.toggleSidebars);

    let leftSidebarVisible = this.sidebarVisibleDefault("left");
    let rightSidebarVisible = this.sidebarVisibleDefault("right");
    let cachedLeftSidebar = localStorage.getItem(
      "layouts-left-sidebar-minimized"
    );
    let leftSidebarMinimized = ["true", "false"].includes(cachedLeftSidebar)
      ? cachedLeftSidebar === "true"
      : settings.layouts_sidebar_left_default_minimized;

    this.setProperties({
      mainLeftOffset,
      mainRightOffset,
      leftSidebarVisible,
      rightSidebarVisible,
      leftWidgetsSet: false,
      rightWidgetsSet: false,
      leftSidebarMinimized,
      rightSidebarMinimized: false,
    });

    this.router.on("routeWillChange", (transition) => {
      // won't run on initial load
      if (transition.from) {
        this.setProperties({
          leftWidgetsSet: false,
          rightWidgetsSet: false,
        });
      }
    });
  },

  @observes(
    "leftSidebarEnabled",
    "mobileView",
    "tabletView",
    "leftSidebarMinimized",
    "leftSidebarVisible"
  )
  toggleBodyClasses() {
    const leftSidebarEnabled = this.get("leftSidebarEnabled");
    const leftSidebarVisible = this.get("leftSidebarVisible");
    const mobileView = this.get("mobileView");
    const tabletView = this.get("tabletView");
    const leftFull = this.get("leftFull");
    const leftSidebarMinimized = this.get("leftSidebarMinimized");

    let addClasses = [];
    let removeClasses = [];

    if (!mobileView && leftSidebarEnabled && leftSidebarVisible && leftFull) {
      addClasses.push(`${layoutsNamespace}-left-full`);
    } else {
      removeClasses.push(`${layoutsNamespace}-left-full`);
    }

    if (!mobileView && leftSidebarMinimized) {
      addClasses.push(`${layoutsNamespace}-sidebar-minimized`);
    } else {
      removeClasses.push(`${layoutsNamespace}-sidebar-minimized`);
    }

    if (tabletView) {
      addClasses.push(`${layoutsNamespace}-tablet`);
    } else {
      removeClasses.push(`${layoutsNamespace}-tablet`);
    }

    addClasses = addClasses.filter(
      (className) => !removeClasses.includes(className)
    );

    if (addClasses.length) {
      document.body.classList.add(...addClasses);
    }

    if (removeClasses.length) {
      document.body.classList.remove(...removeClasses);
    }
  },

  @on("willDestroy")
  teardownMixin() {
    $(window).off("resize", bind(this, this.handleWindowResize));
    this.appEvents.off("sidebar:toggle", this, this.toggleSidebars);
  },

  sidebarVisibleDefault(side) {
    if (this.mobileView) {
      return false;
    }
    return (
      this.siteSettings[`layouts_sidebar_${side}_default_visibility`] === "show"
    );
  },

  toggleSidebars(opts) {
    const mobileView = this.mobileView;
    const { side, value, target } = opts;
    let type = opts.type || "visibility";

    if (
      (target === "mobile" && !mobileView) ||
      (target === "desktop" && mobileView)
    ) {
      return;
    }

    let sides = side ? [side] : ["left", "right"];

    sides.forEach((s) => {
      if (type === "minimize") {
        localStorage.setItem("layouts-left-sidebar-minimized", value);
        this.set(`${s}SidebarMinimized`, value);
      } else {
        let newVal = [true, false].includes(value)
          ? value
          : !Boolean(this[`${s}SidebarVisible`]);

        if (mobileView) {
          const $sidebar = $(`.sidebar.${s}`);
          const $sidebarCloak = $(".sidebar-cloak");

          if (newVal) {
            $sidebar.addClass("open");
            $sidebarCloak.css("opacity", 0.5);
            $sidebarCloak.show();
          } else {
            $sidebar.removeClass("open");
            $sidebarCloak.css("opacity", 0);
            $sidebarCloak.hide();
          }
        }

        this.set(`${s}SidebarVisible`, newVal);
      }
    });
  },

  handleWindowResize() {
    const windowWidth = $(window).width();
    const mobileThreshold = this.siteSettings.layouts_sidebar_mobile_threshold;
    const tabletThreshold = this.siteSettings.layouts_sidebar_tablet_threshold;
    const mobileView = this.get("mobileView");
    const tabletView = this.get("tabletView");

    if (windowWidth < Number(mobileThreshold)) {
      if (!mobileView) {
        this.setProperties({
          mobileView: true,
          tabletView: false,
          leftSidebarVisible: false,
          rightSidebarVisible: false,
        });
      }
    } else {
      if (mobileView) {
        this.setProperties({
          mobileView: false,
          leftSidebarVisible: true,
          rightSidebarVisible: true,
        });
      }

      if (windowWidth < Number(tabletThreshold)) {
        if (!tabletView) {
          this.setProperties({
            tabletView: true,
            leftSidebarMinimized: true,
          });
        }
      } else {
        if (tabletView) {
          this.setProperties({
            tabletView: false,
            leftSidebarMinimized: false,
          });
        }
      }
    }
  },

  @discourseComputed(
    "path",
    "loading",
    "mobileView",
    "tabletView",
    "hasRightSidebar",
    "hasLeftSidebar",
    "showMobileMenu"
  )
  mainClasses(
    path,
    loading,
    mobileView,
    tabletView,
    hasRight,
    hasLeft,
    showMenu
  ) {
    let p = path.split(".");
    let classes = `${p[0]} ${p[1] ? p[1].split(/(?=[A-Z])/)[0] : ""}`;

    if (hasLeft || hasRight) {
      classes += " has-sidebars";
    } else {
      classes += " no-sidebars";
    }
    if (hasLeft) {
      classes += " left-sidebar";
    }
    if (hasRight) {
      classes += " right-sidebar";
    }
    if (mobileView) {
      classes += " mobile";

      if (showMenu) {
        classes += " has-menu";
      }
    }
    if (tabletView) {
      classes += " tablet";
    }
    if (loading) {
      classes += " loading";
    }

    return classes;
  },

  @discourseComputed(
    "mobileView",
    "tabletView",
    "leftSidebarVisible",
    "leftSidebarMinimized"
  )
  leftClasses(mobileView, tabletView, visible) {
    return this.buildSidebarClasses(mobileView, tabletView, visible, "left");
  },

  @discourseComputed("mobileView", "tabletView", "rightSidebarVisible")
  rightClasses(mobileView, tabletView, visible) {
    return this.buildSidebarClasses(mobileView, tabletView, visible, "right");
  },

  buildSidebarClasses(mobileView, tabletView, visible, side) {
    let classes = "";

    if (mobileView) {
      classes += "mobile";

      if (visible) {
        classes += " open";
      }
    } else {
      if (!visible) {
        classes += " not-visible";
      }
      if (tabletView) {
        classes += " tablet";
      }
    }

    classes += ` ${this.siteSettings[`layouts_sidebar_${side}_position`]}`;
    return classes;
  },

  @discourseComputed("path", "hasLeftSidebar", "hasRightSidebar")
  mainStyle(path, hasLeftSidebar, hasRightSidebar) {
    if (this.mobileView) {
      return;
    }
    const mainLeftOffset = this.mainLeftOffset;
    const mainRightOffset = this.mainRightOffset;
    const leftFull = this.leftFull;

    let offset = 0;
    let style = "";
    if (hasLeftSidebar) {
      offset += mainLeftOffset;
    }
    if (hasRightSidebar) {
      offset += mainRightOffset;
    }
    if (hasLeftSidebar && leftFull) {
      offset = 0;
    }
    style += `width: ${offset > 0 ? `calc(100% - ${offset}px)` : "100%"}`;
    return htmlSafe(style);
  },

  @discourseComputed("hasLeftSidebar", "hasRightSidebar")
  rootStyle(hasLeftSidebar) {
    const root = document.documentElement;
    const leftFull = this.leftFull;

    if (hasLeftSidebar && leftFull) {
      root.style.setProperty("overflow-x", "hidden");
    }
  },

  @discourseComputed(
    "path",
    "mobileView",
    "leftSidebarVisible",
    "leftSidebarMinimized"
  )
  leftStyle(path, mobileView, visible, leftSidebarMinimized) {
    const width = this.siteSettings.layouts_sidebar_left_width;

    let string;
    if (mobileView) {
      string = `width: 100vw; transform: translateX(${
        visible ? "0" : `-100vw`
      });`;
    } else {
      string = `width: ${visible ? width : 0}px;`;
    }

    if (!mobileView && leftSidebarMinimized) {
      string = "width: max-content";
    }

    return htmlSafe(string);
  },

  @discourseComputed("path", "mobileView", "rightSidebarVisible")
  rightStyle(path, mobileView, visible) {
    const width = this.siteSettings.layouts_sidebar_right_width;

    let string;
    if (mobileView) {
      string = `width: 100vw; transform: translateX(${
        visible ? `0` : `100vw`
      });`;
    } else {
      string = `width: ${visible ? width : 0}px;`;
    }

    return htmlSafe(string);
  },

  @discourseComputed("leftSidebarEnabled", "rightSidebarEnabled")
  mobileMenuItems() {
    const inputs = this.siteSettings.layouts_mobile_menu.split("|");
    return inputs.reduce((items, input) => {
      let firstSeperator = input.indexOf("~~");
      let lastSeperator = input.lastIndexOf("~~");
      let type = input.substring(0, firstSeperator),
        icon,
        url;
      let isLink = type === "link";
      let isSidebarToggle = ["left", "right"].indexOf(type) > -1;

      if (isLink) {
        icon = input.substring(firstSeperator + 2, lastSeperator);
        url = input.substring(lastSeperator + 2, input.length);
      } else if (isSidebarToggle) {
        icon = input.substring(firstSeperator + 2, input.length);
      }

      if (icon) {
        let iconClass, iconHtml, action, actionParam;

        if (isSidebarToggle && this[`${type}SidebarEnabled`]) {
          iconClass = `mobile-toggle ${type}`;
          action = "toggleSidebar";
          actionParam = type;
        } else if (isLink) {
          iconClass = "mobile-link";
          action = "goToLink";
          actionParam = url;
        }

        try {
          let iconUrl = new URL(icon);
          iconHtml = htmlSafe(`<img src=${iconUrl.href} class="image-icon">`);
        } catch (_) {
          iconHtml = htmlSafe(iconHTML(icon));
        }

        if (iconHtml && iconClass && action && actionParam) {
          items.push({
            icon: iconHtml,
            class: iconClass,
            action,
            actionParam,
          });
        }
      }

      return items;
    }, []);
  },

  actions: {
    toggleSidebar(side) {
      this.appEvents.trigger("sidebar:toggle", { side });
    },

    setWidgets(side, widgets) {
      this.set(`${side}Widgets`, widgets);
      this.set(`${side}WidgetsSet`, true);
    },

    goToLink(link) {
      DiscourseURL.routeTo(link);
    },
  },
});
