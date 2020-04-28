import { ajax } from 'discourse/lib/ajax';
import LayoutWidget from '../models/layout-widget';
import { listLayoutsWidgets } from '../lib/layouts';
import { default as discourseComputed, observes } from 'discourse-common/utils/decorators';
import { not, empty } from "@ember/object/computed";
import Component from '@ember/component';
import { getOwner } from 'discourse-common/lib/get-owner';

function generateDisplayName(name) {
  return name.replace("layouts-", "")
    .replace(/[_\-]+/g, ' ')
    .replace(/(^\w|\b\w)/g, (m) => m.toUpperCase());
}

export default Component.extend({
  tagName: 'tr',
  classNames: 'admin-list-item',
  saveDisabled: not('dirty'),
  dirty: false,

  didInsertElement() {
    this._super(...arguments);    
    if (!this.widget.isNew) {
      this.set('existingWidget', JSON.parse(JSON.stringify(this.widget)));
    }
  },
  
  update(type, value) {
    this.set(`widget.${type}`, value);
    
    const widget = this.widget;
    if (widget.isNew) {
      this.set('dirty', !!widget.name);
    } else {
      this.set('dirty', value !== this.existingWidget[type]);
    }
  },
  
  @discourseComputed('widget.name')
  widgetDisplayName(name) {
    return generateDisplayName(name);
  },
  
  @discourseComputed
  widgetList() {
    return listLayoutsWidgets().map(name => {
      return {
        id: name,
        name: generateDisplayName(name)
      }
    })
  },

  actions: {
    updateOrder(order) {
      this.update('order', order);
    },
    
    updatePosition(position) {
      this.update('position', position);
    },
    
    updateGroups(groups) {
      this.update('groups', groups);
    },
    
    updateEnabled(enabled) {
      this.update('enabled', enabled);
    },
       
    save() {
      if (!this.dirty) return false;
      
      const widget = this.widget;
            
      if (widget.isNew && !widget.name) {
        return false;
      }
      
      this.set('saving', true);
      
      LayoutWidget.save(widget).then(result => {
        if (result.widget) {
          this.setProperties({
            widget: result.widget,
            existingWidget: JSON.parse(JSON.stringify(result.widget))
          });
        } else if (this.existingWidget) {
          this.set('widget', this.existingWidget);
        }
        
        this.set('dirty', false);
      }).finally(() => this.set('saving', false));
    },
    
    remove() {
      const widget = this.widget;
      if (!widget) return false;
      
      this.set('saving', true);
      LayoutWidget.remove(widget).then(result => {
        if (result.success) {
          this.removeWidget(widget);
        } else {
          this.set('saving', false);
        };
      });
    }
  }
});
