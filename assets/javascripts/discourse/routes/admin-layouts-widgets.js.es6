import LayoutWidget from "../models/layout-widget";
import DiscourseRoute from "discourse/routes/discourse";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

export default DiscourseRoute.extend({
  model() {
    return LayoutWidget.list();
  },

  setupController(controller, model) {
    controller.set("widgets", A(model.map((w) => EmberObject.create(w))));
  },
});
