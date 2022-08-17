import Controller from "@ember/controller";
import discourseComputed from "discourse-common/utils/decorators";

export default Controller.extend({
  @discourseComputed("model.content")
  installedThemes(content) {
    return content || [];
  }
});
