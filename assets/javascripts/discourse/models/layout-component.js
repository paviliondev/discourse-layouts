import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import discourseComputed from "discourse-common/utils/decorators";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

const LayoutComponent = EmberObject.extend({
  @discourseComputed("theme_id")
  themeUrl(themeId) {
    let url = '/admin/customize/themes';
    if (themeId) {
      url = `${url}/${themeId}`;
    }
    return url;
  },
});

LayoutComponent.reopenClass({
  install(url) {
    return ajax("/admin/themes/import", {
      type: "POST",
      data: {
        remote: url
      }
    }).catch(popupAjaxError);
  },

  list() {
    return ajax("/admin/layouts/components", {
      type: "GET",
    }).catch(popupAjaxError);
  },

  createArray(data) {
    return A(data.map((c) => LayoutComponent.create(c)));
  }
});

export default LayoutComponent;
