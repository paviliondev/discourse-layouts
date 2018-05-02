import Sidebars from '../mixins/sidebars';

export default Ember.Controller.extend(Sidebars, {
  application: Ember.inject.controller(),
  tagsShow: Ember.inject.controller(),
  category: Ember.computed.alias('tagsShow.category'),
  mainContent: 'tags'
});
