import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import discourseComputed from "discourse-common/utils/decorators";
import { equal } from "@ember/object/computed";
import EmberObject from "@ember/object";
import { A } from "@ember/array";

const LayoutWidget = EmberObject.extend({
  @discourseComputed("component.id")
  componentUrl(componentId) {
    let url = '/admin/layouts/components';
    return url;
  },

  isNew: equal("id", "new")
});

LayoutWidget.reopenClass({
  list() {
    return ajax("/admin/layouts/widgets", {
      type: "GET",
    }).catch(popupAjaxError);
  },

  save(widget) {
    return ajax(`/admin/layouts/widgets/${widget.id}`, {
      type: widget.isNew ? "POST" : "PUT",
      data: {
        widget: JSON.parse(JSON.stringify(widget)),
      },
    }).catch(popupAjaxError);
  },

  toggle(widget, state) {
    return ajax(`/admin/layouts/widgets/${widget.id}/toggle`, {
      type: "PUT",
      data: {
        state
      }
    }).catch(popupAjaxError);
  },

  remove(widget) {
    return ajax(`/admin/layouts/widgets/${widget.id}`, {
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

  createArray(data) {
    return A(data.map((w) => LayoutWidget.create(w)));
  }
});

export default LayoutWidget;
