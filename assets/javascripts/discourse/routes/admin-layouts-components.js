import DiscourseRoute from "discourse/routes/discourse";
import LayoutComponent from "../models/layout-component";

export default DiscourseRoute.extend({
  model() {
    return LayoutComponent.list({ all: true, themes: true });
  },

  setupController(controller, model) {
    controller.setProperties({
      components: LayoutComponent.createArray(model.components),
      themes: model.themes
    });
  },
});
