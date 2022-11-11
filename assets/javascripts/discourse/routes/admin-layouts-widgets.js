import LayoutWidget from "../models/layout-widget";
import LayoutComponent from "../models/layout-component";
import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  model() {
    return LayoutWidget.list();
  },

  afterModel(model = {}) {
    return LayoutComponent.list({ installed: true }).then(result => {
      if (result.components) {
        model.components = result.components;
      }
    });
  },

  setupController(controller, model = {}) {
    let props = {};

    if (model.widgets) {
      props.widgets = LayoutWidget.createArray(model.widgets)
    }

    if (model.components) {
      props.components = model.components.map(c => ({ id: c.id, name: c.nickname }));
    }

    controller.setProperties(props);
  },
});
