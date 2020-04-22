import { ajax } from 'discourse/lib/ajax';
import LayoutWidget from '../models/layout-widget';
import { default as discourseComputed, observes } from 'discourse-common/utils/decorators';
import { not } from "@ember/object/computed";
import Component from '@ember/component';

export default Component.extend({
  tagName: 'tr',
  classNames: 'admin-list-item',
  saveDisabled: not('dirty'),
  dirty: false,

  didInsertElement() {
    this._super(...arguments);
    this.set('existingWidget', JSON.parse(JSON.stringify(this.widget)));
  },
  
  @discourseComputed('widget.source')
  sourceName(source) {
    if (!source) return '';
    let parts = source.split(':');
    return parts[parts.length > 1 ? 1 : 0];
  },
  
  @discourseComputed('widget.source')
  sourceUrl(source) {
    if (!source) return '';
    let parts = source.split(':');
    
    if (parts.length > 1 ) {
      return parts[0] == 'plugin' ? '/admin/plugins' : '/admin/customize/themes';
    } else {
      return '';
    }
  },
  
  update(type, value) {
    this.set(`widget.${type}`, value);
    this.set('dirty', value !== this.existingWidget[type]);
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
      this.set('saving', true);
      
      LayoutWidget.save(this.widget).then(result => {
        if (result.widget) {
          this.setProperties({
            widget: result.widget,
            existingWidget: JSON.parse(JSON.stringify(result.widget))
          });
        } else {
          this.set('widget', this.existingWidget);
        }
        
        this.set('dirty', false);
      }).finally(() => this.set('saving'), false);
    }
  }
});
