import MountWidget from 'discourse/components/mount-widget';
import { observes, default as computed } from 'ember-addons/ember-computed-decorators';

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'fixed', 'editing'],
  widget: 'sidebar',

  @computed()
  fixed() {
    return Discourse.SiteSettings[`layouts_sidebar_${this.get('side')}_fixed`];
  },

  buildArgs() {
    const context = this.get('context');
    const side = this.get('side');
    const editing = this.get('editing');
    const category = this.get('category');
    let args = { context, side, editing, category };

    if (context === 'discovery') {
      args['filter'] = this.get('filter');
    }

    if (context === 'topic') {
      args['topic'] = this.get('topic');
    }

    const customWidgetProps = this.get('customWidgetProps');
    if (customWidgetProps && customWidgetProps.length > 0) {
      args['customWidgetProps'] = customWidgetProps;
    }

    return args;
  },

  @observes('topic', 'category', 'topic.details.created_by', 'editing', 'customWidgetProps')
  updateOnModelChange() {
    this.queueRerender();
    this.appEvents.trigger('sidebars:rerender');
  }
});
