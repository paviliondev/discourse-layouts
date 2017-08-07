import MountWidget from 'discourse/components/mount-widget';
import { observes, on, default as computed } from 'ember-addons/ember-computed-decorators';

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'fixed', 'editing'],
  widget: 'sidebar',

  @computed()
  fixed() {
    return Discourse.SiteSettings[`layouts_sidebar_${this.get('side')}_fixed`]
  },

  buildArgs() {
    const context = this.get('context');
    const side = this.get('side');
    const editing = this.get('editing');
    const category = this.get('category');
    const navCategory = this.get('navCategory');
    let args = { context, side, editing, category, navCategory };

    if (context === 'discovery') {
      args['filter'] = this.get('filter');
    }

    if (context === 'topic') {
      args['topic'] = this.get('topic');
    }

    return args;
  },

  @observes('topic', 'category', 'topic.details.created_by', 'editing', 'currentUser.left_apps', 'currentUser.right_apps')
  updateOnModelChange() {
    this.queueRerender();
    this.appEvents.trigger('sidebars:rerender');
  }
});
