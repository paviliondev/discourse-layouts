import { ajax } from 'discourse/lib/ajax';

export default Discourse.Route.extend({
  model() {
    return ajax('/admin/layouts/widgets');
  },

  setupController(controller, model) {
    let widgets = [];
    model.widgets.forEach((w) => {
      if (w !== null && typeof w === 'object') {
        widgets.push(w);
      } else if (typeof w === 'string') {
        widgets.push({ name: w });
      } else {
        widgets.push({ name: null });
      }
    });
    controller.set('widgets', widgets);
  }
});
