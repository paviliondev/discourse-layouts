import LayoutWidget from '../models/layout-widget';
import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  model() {
    return LayoutWidget.list();
  },

  setupController(controller, model) {
    controller.set('widgets', model);
  }
});
