export default Ember.Component.extend({
  actions: {
    clear() {
      this.sendAction('clear', this.get('widget')['name']);
    }
  }
});
