import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import EmberObject from "@ember/object";

const LayoutWidget = EmberObject.extend();

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
});

export default LayoutWidget;
