import { createWidget } from 'discourse/widgets/widget';

var isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val)
}

export default createWidget('sidebar', {
  tagName: 'div.sidebar-content',

  html(args) {
    const siteEnabled = Discourse.SiteSettings[`layouts_sidebar_${args.side}_enabled`].split('|');
    const userSelectionEnabled = Discourse.SiteSettings.layouts_sidebar_user_selected_widgets;
    const user = this.currentUser;

    let generalWidgets = [];
    let orderedWidgets = [];

    const siteWidgets = this.site.get('widgets');
    if (siteWidgets) {
      let sideWidgets = siteWidgets.filter((w) => w.position === args.side);

      if (sideWidgets) {
        generalWidgets = sideWidgets.filter((w) => !w.order);
        orderedWidgets = sideWidgets.filter((w) => {
          return isNumeric(w.order) || (w.order === 'start' || w.order === 'end')
        });
      }
    };

    let contents = [];
    let widgets = [];
    let index = null;
    let isUser = false;

    if (user && userSelectionEnabled) {
      var userApps = user.get(`${args.side}_apps`) || [];
      if (userApps.length > 0) {
        widgets.push(...userApps);
      }
    } else {
      if (args.context === 'discovery' || args.context === 'tags') {
        let categoryEnabled = args.category ? args.category.get(`layouts_sidebar_${args.side}_enabled`) : '';
        if (!args.category || siteEnabled.indexOf('category') > -1) {
          generalWidgets.forEach((w) => widgets.push(w.name));
        }
        if (categoryEnabled && categoryEnabled.split('|').indexOf(args.filter) > -1) {
          args.category.get(`layouts_sidebar_${args.side}_widgets`).split('|').forEach((widget) => {
            if (widgets.indexOf(widget) === -1) {
              widgets.push(widget);
            }
          })
        }
      }
      if (args.context === 'topic' && siteEnabled.indexOf('topic') > -1) {
        generalWidgets.forEach((w) => widgets.push(w.name));
      }
    }

    orderedWidgets.forEach((w) => {
      if (isNumeric(w.order)) {
        widgets.splice(w.order, 0, w.name)
      }
    });

    // 'start' & 'end' overide numbered ordering
    orderedWidgets.forEach((w) => {
      if (w.order === 'start') {
        widgets.unshift(w.name)
      }
      if (w.order === 'end') {
        widgets.push(w.name)
      }
    })

    widgets.forEach((widget) => {
      if (widget.length) {
        const exists = this.register.lookupFactory(`widget:${widget}`);

        if (exists) {
          if (user && userSelectionEnabled) {
            let userIndex = userApps.indexOf(widget);
            let index = null;
            if (userIndex > -1) {
              isUser = true;
              index = userIndex;
            }
          }

          contents.push(this.attach(widget, {
            topic: args.topic,
            category: args.category,
            navCategory: args.navCategory,
            isUser,
            editing: args.editing,
            side: args.side,
            index
          }))
        }
      }
    })

    return contents;
  }
})
