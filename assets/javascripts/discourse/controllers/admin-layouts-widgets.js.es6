import { ajax } from 'discourse/lib/ajax';
import { default as discourseComputed } from 'discourse-common/utils/decorators';
import { alias } from "@ember/object/computed";
import LayoutWidget from '../models/layout-widget';
import EmberObject from '@ember/object';

function buildSelectKit(items, type) {
  return items.map(item => {
    return {
      id: item,
      name: isNaN(item) ? I18n.t(`admin.layouts.widgets.${type}.${item}`) : item
    }
  })
}

export default Ember.Controller.extend({
  positionList: buildSelectKit(['left', 'right'], 'position'),

  @discourseComputed('widgets.length')
  orderList(widgetCount) {
    const items = ['start', 'end'];
    if (widgetCount > 0) {
      for (let i=1; i<=widgetCount; i++) {
        items.push(i.toString());
      }
    }
    return buildSelectKit(items, 'order');
  },

  groupList: alias('site.groups'),
    
  actions: {
    addWidget() {
      this.get('widgets').pushObject(
        EmberObject.create({
          isNew: true
        })
      )
    },
    
    removeWidget(widget) {
      this.get('widgets').removeObject(widget)
    }
  }
});
