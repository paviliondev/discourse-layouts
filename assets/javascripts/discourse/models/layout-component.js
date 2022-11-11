import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import discourseComputed from "discourse-common/utils/decorators";
import { equal } from "@ember/object/computed";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

const LayoutComponent = EmberObject.extend({
  isNew: equal("id", "new"),

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
  installComponent(url) {
    return ajax("/admin/layouts/components/install", {
      type: "POST",
      data: {
        url
      }
    }).catch(popupAjaxError);
  },

  list(data) {
    return ajax("/admin/layouts/components", {
      type: "GET",
      data
    }).catch(popupAjaxError);
  },

  createComponent(component) {
    return ajax(`/admin/layouts/components/${component.id}`, {
      type: "POST",
      data: {
        component
      },
    }).catch(popupAjaxError);
  },

  removeComponent(component) {
    return ajax(`/admin/layouts/components/${component.id}`, {
      type: "DELETE",
    }).catch(popupAjaxError);
  },

  createArray(data) {
    return A(data.map((c) => LayoutComponent.create(c)));
  }
});

export default LayoutComponent;
