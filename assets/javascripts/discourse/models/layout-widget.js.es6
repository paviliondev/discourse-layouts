import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from 'discourse/lib/ajax-error';
import EmberObject from "@ember/object";

const LayoutWidget = EmberObject.extend();

LayoutWidget.reopenClass({
  list() {
    return ajax("/admin/layouts/widgets", {
      type: 'GET'
    }).catch(popupAjaxError)
  },

  save(widget) {    
    return ajax(`/admin/layouts/widgets/${widget.name}`, {
      type: 'PUT',
      data: {
        widget
      }
    }).catch(popupAjaxError)
  }
});

export default LayoutWidget;
