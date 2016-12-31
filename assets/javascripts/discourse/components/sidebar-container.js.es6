import MountWidget from 'discourse/components/mount-widget';
import { observes, on, default as computed } from 'ember-addons/ember-computed-decorators';

export default MountWidget.extend({
  classNameBindings: [':sidebar-container', 'fixed'],
  widget: 'sidebar',

  @computed()
  fixed() {
    return Discourse.SiteSettings[`sidebar_${this.get('side')}_fixed`]
  },

  buildArgs() {
    const context = this.get('context');
    const side = this.get('side');
    let args = {
      context: context,
      side: side
    }

    if (context === 'discovery') {
      args['filter'] = this.get('filter');
      args['category'] = this.get('category');
    }

    if (context === 'topic') {
      args['topic'] = this.get('topic');
      args['category'] = this.get('topic.category');
    }

    return args;
  },

  @observes('topic', 'category')
  updateOnModelChange() {
    this.queueRerender()
  }
});
