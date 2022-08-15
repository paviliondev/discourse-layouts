import {
  default as discourseComputed,
  observes,
} from "discourse-common/utils/decorators";
import { alias, readOnly } from "@ember/object/computed";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import {
  getContextFromAttr,
  layoutsNamespace,
  normalizeContext,
  setupContexts,
} from "../lib/layouts";
import { withPluginApi } from "discourse/lib/plugin-api";

const PLUGIN_ID = "discourse-layouts";

export default {
  name: "sidebars",
  initialize(container) {
    const site = container.lookup("site:main");
    const siteSettings = container.lookup("site-settings:main");
    const router = container.lookup("router:main");

    if (
      !siteSettings.layouts_enabled ||
      (site.mobileView && !siteSettings.layouts_mobile_enabled)
    ) {
      return;
    }

    setupContexts();

    router.on("routeDidChange", (transition) => {
      if (!transition.from) {
        return;
      }

      const routeInfos = transition.router.currentRouteInfos;
      const routeNames = routeInfos.map((ri) => ri.name);
      let changedToContext;

      routeNames.forEach((routeName) => {
        let routeContext = getContextFromAttr(routeName, "route");

        if (routeContext) {
          changedToContext = normalizeContext(routeContext);
        }
      });

      if (!changedToContext) {
        let classes = document.body.className
          .split(" ")
          .filter((c) => !c.startsWith(`${layoutsNamespace}-`));
        document.body.className = classes.join(" ").trim();
      }
    });

    withPluginApi("0.8.32", (api) => {
      api.modifyClass("controller:discovery", {
        pluginId: PLUGIN_ID,
        router: service(),
        currentPath: readOnly("router.currentRouteName"),
        navigationDefault: controller("navigation/default"),
        navigationCategory: controller("navigation/category"),

        @discourseComputed(
          "navigationDefault.filterType",
          "navigationCategory.filterType",
          "currentPath"
        )
        sidebarFilter(defaultFilter, categoryFilter, currentPath) {
          if (!currentPath) {
            return undefined;
          }
          let path = currentPath.toLowerCase();
          if (path.indexOf("categories") > -1) {
            return "categories";
          }
          if (path.indexOf("category") > -1) {
            return categoryFilter;
          }
          return defaultFilter;
        },
      });

      api.modifyClass("controller:topic", {
        pluginId: PLUGIN_ID,
        category: alias("model.category"),
        userHideRightSidebar: false,
      });

      api.modifyClass("component:topic-navigation", {
        pluginId: PLUGIN_ID,
        controller: controller("topic"),

        @observes("controller.hasRightSidebar")
        sidebarsUpdated() {
          this._performCheckSize();
        },

        _performCheckSize() {
          if (!this.element || this.isDestroying || this.isDestroyed) {
            return;
          }

          const hasRightSidebar = this.controller.get("hasRightSidebar");
          if (hasRightSidebar && !this.info.get("topicProgressExpanded")) {
            const info = this.get("info");
            info.setProperties({
              renderTimeline: false,
              renderAdminMenuButton: true,
            });
          } else {
            this._super(...arguments);
          }
        },
      });
    });
  },
};
