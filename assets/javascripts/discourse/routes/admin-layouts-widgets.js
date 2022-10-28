import LayoutWidget from "../models/layout-widget";
import LayoutComponent from "../models/layout-component";
import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  model() {
    return LayoutWidget.list();
  },

  afterModel(model = {}) {
    return LayoutComponent.list().then(result => {
      if (result.components) {
        model.components = result.components;
      }
    });
  },

  setupController(controller, model) {
    let props = {
      widgets: LayoutWidget.createArray(model.widgets)
    }

    if (model.components) {
      props.installedComponents = model.components
        .filter(c => c.installed)
        .map(c => ({ id: c.theme_id, name: c.theme_name, component_name: c.name }));
    }

    controller.setProperties(props);
  },
});
