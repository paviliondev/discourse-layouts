import Controller from "@ember/controller";
import LayoutWidget from "../models/layout-widget";
import discourseComputed from "discourse-common/utils/decorators";

export default Controller.extend({
  @discourseComputed("widgets.[]")
  addWidgetDisabled(widgets) {
    return widgets.findBy("id", "new");
  },

  actions: {
    addWidget() {
      this.get("widgets").unshiftObject(
        LayoutWidget.create({
          id: "new",
          editing: true
        })
      );
    },

    removeWidget(widget) {
      this.get("widgets").removeObject(widget);
    },
  },
});
