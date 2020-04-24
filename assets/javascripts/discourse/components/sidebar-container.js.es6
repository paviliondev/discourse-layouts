import MountWidget from 'discourse/components/mount-widget';
import { observes, default as discourseComputed, on } from 'discourse-common/utils/decorators';

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'fixed', 'editing'],
  widget: 'sidebar',

  @on('init')
  setupRerenderTrigger() {
    const side = this.get('side');
    this.appEvents.on('sidebars:rerender', () => {
      this.rerenderSidebars();
    });
  },

  @discourseComputed()
  fixed() {
    return Discourse.SiteSettings[`layouts_sidebar_${this.get('side')}_fixed`];
  },

  buildArgs() {
    const context = this.get('context');
    const side = this.get('side');
    const category = this.get('category');
    let args = { context, side, category };

    if (context === 'discovery') {
      args['filter'] = this.get('filter');
    }

    if (context === 'topic') {
      args['topic'] = this.get('topic');
    }

    const customSidebarProps = this.get('customSidebarProps');
    if (customSidebarProps) {
      args['customSidebarProps'] = customSidebarProps;
    }

    return args;
  },

  @observes('topic', 'category', 'topic.details.created_by')
  rerenderSidebars() {
    this.queueRerender();
    this.appEvents.trigger('sidebars:after-render');
  }
});
