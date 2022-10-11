import MountWidget from "discourse/components/mount-widget";
import {
  default as discourseComputed,
  observes,
  on,
} from "discourse-common/utils/decorators";
import { alias, readOnly } from "@ember/object/computed";
import { getOwner } from "discourse-common/lib/get-owner";
import { scheduleOnce } from "@ember/runloop";
import { getAttrFromContext } from "../lib/layouts";
import { inject as service } from "@ember/service";

export default MountWidget.extend({
  classNameBindings: [":layouts-widgets-container", "editing"],
  widget: "layouts-widgets",
  router: service(),
  path: alias("router._router.currentPath"),
  customSidebarProps: readOnly("controller.customSidebarProps"),
  category: readOnly("controller.category"),
  filter: alias("controller.layoutsFilter"),

  @on("init")
  setupRerenderTrigger() {
    this.appEvents.on("sidebars:rerender", () => {
      this.rerenderSidebars();
    });
  },

  @discourseComputed("context")
  controller(context) {
    return getOwner(this).lookup(
      `controller:${getAttrFromContext(context, "controller")}`
    );
  },

  buildArgs() {
    const position = this.position;
    const controller = this.controller;
    const context = this.context;
    const path = this.path;
    const tabletView = this.tabletView;
    const mobileView = this.mobileView;
    const sidebarMinimized = this.sidebarMinimized;

    let args = {
      context,
      path,
      position,
      controller,
      mobileView,
      tabletView,
      sidebarMinimized,
    };

    if (context === "discovery") {
      args.filter = this.filter;
    }
    if (
      ["discovery", "topic"].indexOf(context) > -1 &&
      path !== "discovery.categories"
    ) {
      args.category = this.category;
    }
    if (context === "topic") {
      args.topic = this.topic;
    }

    const customSidebarProps = this.customSidebarProps;
    if (customSidebarProps) {
      args.customSidebarProps = customSidebarProps;
    }

    return args;
  },

  @observes("path", "mobileView", "tabletView")
  rerenderSidebars() {
    this.queueRerender();
    scheduleOnce("afterRender", () => {
      this.appEvents.trigger("sidebars:after-render");
    });
  },
});
