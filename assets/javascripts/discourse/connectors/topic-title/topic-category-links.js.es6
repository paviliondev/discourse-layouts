export default {
  setupComponent() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      // ensure topic links are the first outlet
      $('.topic-category-links').prependTo('.title-wrapper + span');
    })
  }
}
