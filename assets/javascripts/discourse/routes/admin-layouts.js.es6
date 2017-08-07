export default Discourse.Route.extend({
  redirect() {
    this.transitionTo('adminLayouts.widgets');
  }
})
