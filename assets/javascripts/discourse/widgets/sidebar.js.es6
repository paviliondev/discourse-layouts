import { createWidget } from 'discourse/widgets/widget';
import { lookupLayoutsWidget, normalizeContext } from '../lib/layouts';
import { later } from "@ember/runloop";

const customWidgets = [];
const addCustomWidget = function(widget) {
  let added = false;

  // replace existing widget record if it exists
  customWidgets.forEach((w, i) => {
    if (w.name === widget.name) {
      added = true;
      customWidgets[i] = widget;
    }
  });

  if (!added) {
    customWidgets.push(widget);
  }
};
export { addCustomWidget };

export default createWidget('sidebar', {
  tagName: 'div.sidebar-content',

  html(args) {
    const user = this.currentUser;
    let {
      side,
      context,
      controller,
      path,
      filter,
      category,
      topic,
      customSidebarProps
    } = args;
        
    let siteWidgets = this.site.layout_widgets || [];
    if (customWidgets.length) {
      siteWidgets = siteWidgets.concat(customWidgets);
    }
    
    context = normalizeContext(context);
    
    let props = { topic, category, side, path };

    if (customSidebarProps) {
      Object.keys(customSidebarProps).forEach((p) => {
        props[p] = customSidebarProps[p];
      });
    };
                        
    let widgets = siteWidgets.filter((w) => {
      if (
          (!this.widgetExists(w.name)) ||
          
          (w.position !== side) ||
          
          (w.contexts.indexOf(context) === -1) ||
          
          (!category &&
            w.category_ids.length) ||
          
          (category &&
            w.category_ids.length &&
            w.category_ids.map(id => Number(id))
              .filter(id => {
                return (Number(category.id) === id) ||
                  (Number(category.parent_category_id) === id);
              }).length === 0) ||
          
          (context === 'discovery' &&
            w.filters.length &&
            w.filters.indexOf(filter) === -1)
        ) {
        return false;
      } else {
        let LayoutsWidgetClass = this.lookupWidgetClass(w.name);
        return LayoutsWidgetClass && 
          LayoutsWidgetClass.prototype.shouldRender(props);
      }
    }).sort(function(a, b) {
      if (a.order === b.order) return 0;
      if (a.order === 'start') return -1;
      if (a.order === 'end') return 1;
      return a - b;
    }).map(w => w.name);
            
    let contents = [];

    if (widgets.length > 0) {
      widgets.forEach((w) => {
        contents.push(this.attach(w, props));
      });
    }
                
    controller.send('setWidgets', side, widgets);

    return contents;
  },

  clickOutside() {
    this.appEvents.trigger('sidebar:toggle', {
      side: this.attrs.side,
      value: false,
      target: 'responsive'
    });
  },
  
  widgetExists(widgetName) {
    return lookupLayoutsWidget(widgetName) ||
      this.register.lookupFactory(`widget:${widgetName}`);
  }
});
