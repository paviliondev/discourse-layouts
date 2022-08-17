import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import discourseComputed from "discourse-common/utils/decorators";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

const LayoutWidget = EmberObject.extend({
  @discourseComputed("theme_id")
  settingsUrl(themeId) {
    let url = '/admin/customize/themes';
    if (themeId) {
      url = `${url}/${themeId}`;
    }
    return url;
  }
});

LayoutWidget.reopenClass({
  list() {
    return ajax("/admin/layouts/widgets", {
      type: "GET",
    }).catch(popupAjaxError);
  },

  save(widget) {
    return ajax(`/admin/layouts/widgets/${widget.name}`, {
      type: widget.isNew ? "POST" : "PUT",
      data: {
        widget: JSON.parse(JSON.stringify(widget)),
      },
    }).catch(popupAjaxError);
  },

  remove(widget) {
    return ajax(`/admin/layouts/widgets/${widget.name}`, {
      type: "DELETE",
    }).catch(popupAjaxError);
  },

  create(attrs) {
    attrs = attrs || {};

    if (attrs.settings) {
      attrs.settings = EmberObject.create(attrs.settings);
    }

    return this._super(attrs);
  },

  createtList(data) {
    let list = data.map((w) => LayoutWidget.create(w));
    return A(list);
  }
});

export default LayoutWidget;
