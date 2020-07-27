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
                    
    let widgets = siteWidgets.filter((w) => {
      return this.widgetExists(w.name) && (
        w.position === side &&
        w.contexts.indexOf(context) > -1 &&
        (
          context !== 'discovery' || (
            (w.filters.length === 0 || w.filters.indexOf(filter) > -1) &&
            (w.category_ids.length === 0 ||
              (
                (!category && w.category_ids.indexOf(0) > -1) ||
                (category && 
                  w.category_ids.map(id => Number(id))
                    .indexOf(Number(category.id)) > -1)
              )
            )
          )
        )
      );
    }).sort(function(a, b) {
      if (a.order === b.order) return 0;
      if (a.order === 'start') return -1;
      if (a.order === 'end') return 1;
      return a - b;
    }).map(w => w.name);
        
    let contents = [];

    if (widgets.length > 0) {
      widgets.forEach((w) => {
        let props = { topic, category, side };

        if (customSidebarProps) {
          Object.keys(customSidebarProps).forEach((p) => {
            props[p] = customSidebarProps[p];
          });
        };
        
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
      onlyResponsive: true
    });
  },
  
  widgetExists(widgetName) {
    return lookupLayoutsWidget(widgetName) ||
      this.register.lookupFactory(`widget:${widgetName}`);
  }
});
