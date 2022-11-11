import Controller from "@ember/controller";
import LayoutComponent from "../models/layout-component";
import discourseComputed from "discourse-common/utils/decorators";

export default Controller.extend({
  @discourseComputed("components.[]")
  addComponentDisabled(components) {
    return components.findBy("id", "new");
  },

  actions: {
    addComponent() {
      this.get("components").unshiftObject(
        LayoutComponent.create({
          id: "new",
          editing: true
        })
      );
    },

    updateComponent(oldComponent, newComponent) {
      const components = this.get("components");
      components.replace(components.indexOf(oldComponent), 1, [newComponent]);
    },

    removeComponent(component) {
      this.get("components").removeObject(component);
    },
  },
});
