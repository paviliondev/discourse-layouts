import { setting } from 'discourse/lib/computed';
var get = Ember.get;

export default Ember.Component.extend({
  classNames: ['nav-drop'],
  expanded: false,
  clickEventName: "click.nav-drop",

  iconClass: function() {
    if (this.get('expanded')) { return "fa fa-caret-down"; }
    return "fa fa-caret-right";
  }.property('expanded'),

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
      var $dropdown = this.$()[0];

      this.$('a[data-drop-close]').on('click.nav-drop', function() {
        self.close();
      });

      Em.run.next(function(){
        self.$('.nav a').add('html').on(self.get('clickEventName'), function(e) {
          self.close();
        });
      });
      
      return false
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
