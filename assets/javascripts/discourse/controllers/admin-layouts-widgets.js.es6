import EmberObject from "@ember/object";
import Controller from "@ember/controller";

export default Controller.extend({
  actions: {
    addWidget() {
      this.get("widgets").unshiftObject(
        EmberObject.create({
          isNew: true,
        })
      );
    },

    removeWidget(widget) {
      this.get("widgets").removeObject(widget);
    },
  },
});
