import { ajax } from 'discourse/lib/ajax';

export default Discourse.Route.extend({
  model() {
    return ajax('/admin/layouts/widgets');
  },

  setupController(controller, model) {
    controller.set('widgets', model.widgets);
  }
})
