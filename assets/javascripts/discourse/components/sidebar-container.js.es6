import MountWidget from 'discourse/components/mount-widget';
import { observes, default as discourseComputed, on } from 'discourse-common/utils/decorators';
import { getOwner } from 'discourse-common/lib/get-owner';
import { scheduleOnce } from "@ember/runloop";

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'editing'],
  widget: 'sidebar',

  @on('init')
  setupRerenderTrigger() {
    const side = this.get('side');
    this.appEvents.on('sidebars:rerender', () => {
      this.rerenderSidebars();
    });
  },
  
  @discourseComputed('context')
  controller(context) {
    return getOwner(this).lookup(`controller:${context}`);
  },

  buildArgs() {
    const context = this.get('context');
    const side = this.get('side');
    const controller = this.get('controller');
    const category = this.get('category');
    const topic = this.get('topic');
    const filter = this.get('filter');
    const customSidebarProps = this.get('customSidebarProps');
    
    let args = {
      context,
      side,
      controller
    };

    if (context === 'discovery') {
      args.filter = filter;
    }
    if (['discovery', 'topic'].indexOf(context) > -1) {
      args.category = category;
    }
    if (context === 'topic') {
      args.topic = topic;
    }
    if (customSidebarProps) {
      args.customSidebarProps = customSidebarProps;
    }
                
    return args;
  },

  @observes('topic.id', 'category.id', 'filter', 'context')
  rerenderSidebars() {
    this.queueRerender();
    scheduleOnce('afterRender', () => {
      this.appEvents.trigger('sidebars:after-render');
    });
  }
});
