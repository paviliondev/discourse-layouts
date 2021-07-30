import MountWidget from 'discourse/components/mount-widget';
import { observes, default as discourseComputed, on } from 'discourse-common/utils/decorators';
import { alias } from "@ember/object/computed";
import { getOwner } from 'discourse-common/lib/get-owner';
import { scheduleOnce } from "@ember/runloop";
import { getAttrFromContext } from "../lib/layouts";
import { inject as service } from "@ember/service";

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'editing'],
  widget: 'sidebar',
  router: service(),
  path: alias("router._router.currentPath"),

  @on('init')
  setupRerenderTrigger() {
    const side = this.get('side');
    this.appEvents.on('sidebars:rerender', () => {
      this.rerenderSidebars();
    });
  },
  
  @discourseComputed('context')
  controller(context) {
    return getOwner(this).lookup(`controller:${getAttrFromContext(context, 'controller')}`);
  },

  buildArgs() {
    const side = this.side;
    const controller = this.controller;
    const context = this.context;
    const path = this.path;
    
    let args = {
      context,
      path,
      side,
      controller
    };

    if (context === 'discovery') {
      args.filter = this.filter;
    }
    if (['discovery', 'topic'].indexOf(context) > -1 &&
          path !== "discovery.categories") {
      args.category = this.category;
    }
    if (context === 'topic') {
      args.topic = this.topic;
    }
    
    const customSidebarProps = this.customSidebarProps;
    if (customSidebarProps) {
      args.customSidebarProps = customSidebarProps;
    }
                
    return args;
  },

  @observes('path')
  rerenderSidebars() {
    this.queueRerender();
    scheduleOnce('afterRender', () => {
      this.appEvents.trigger('sidebars:after-render');
    });
  }
});
