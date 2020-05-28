import Component from '@ember/component';
import { default as discourseComputed } from 'discourse-common/utils/decorators';

export default Component.extend({
  classNames: ['nav-drop'],
  expanded: false,
  clickEventName: "click.nav-drop",
  
  @discourseComputed('expanded')
  iconClass(expanded) {
    if (expanded) { return "caret-down"; }
    return "caret-right";
  },

  actions: {
    expand: function() {
      var self = this;

      if(!this.get('renderNavItems')){
        this.set('renderNavItems',true);
        Em.run.next(function(){
          self.send('expand');
        });
        return;
      }

      if (this.get('expanded')) {
        this.close();
        return;
      }

      this.set('expanded', true);

      this.$('a[data-drop-close]').on('click.nav-drop', function() {
        self.close();
      });

      Em.run.next(function(){
        self.$('.nav a').add('html').on(self.get('clickEventName'), function() {
          self.close();
        });
      });

      return false;
    }
  },

  removeEvents: function(){
    $('html').off(this.get('clickEventName'));
    this.$('a[data-drop-close]').off('click.nav-drop');
  },

  close: function() {
    this.removeEvents();
    this.set('expanded', false);
  },

  willDestroyElement: function() {
    this.removeEvents();
  }

});
