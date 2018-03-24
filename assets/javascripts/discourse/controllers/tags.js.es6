import Sidebars from '../mixins/sidebars';

export default Ember.Controller.extend(Sidebars, {
  application: Ember.inject.controller(),
  mainContent: 'tags'
});
