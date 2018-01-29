import { createWidget } from 'discourse/widgets/widget';
import { toggleSidebar } from '../lib/display';

var isNumeric = function(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default createWidget('sidebar', {
  tagName: 'div.sidebar-content',

  html(args) {
    const category = args.category;
    const siteEnabled = Discourse.SiteSettings[`layouts_sidebar_${args.side}_enabled`].split('|');
    const siteEnabledGlobal = Discourse.SiteSettings[`layouts_sidebar_${args.side}_enabled_global`];
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
          return isNumeric(w.order) || (w.order === 'start' || w.order === 'end');
        });
      }
    };

    let contents = [];
    let widgets = [];
    let isUser = false;
    let userApps;

    if (user && userSelectionEnabled) {
      userApps = user.get(`${args.side}_apps`) || [];
      if (userApps.length > 0) {
        widgets.push(...userApps);
      }
    } else {
      let categoryWidgets;
      let categoryEnabled;

      if (category) {
        const cw = category.get(`layouts_sidebar_${args.side}_widgets`);
        const ce = category.get(`layouts_sidebar_${args.side}_enabled`);
        categoryWidgets = cw ? cw.split('|') : [];
        categoryEnabled = ce ? ce.split('|') : false;
      }

      if (args.context === 'discovery' || args.context === 'tags') {

        if (!category || siteEnabledGlobal || siteEnabled.indexOf('category') > -1) {
          generalWidgets.forEach((w) => widgets.push(w.name));
        }

        if (categoryEnabled && categoryEnabled.indexOf(args.filter) > -1) {
          categoryWidgets.forEach((widget) => {
            if (widgets.indexOf(widget) === -1) {
              widgets.push(widget);
            }
          });
        }
      }

      if (args.context === 'topic') {
        if (siteEnabledGlobal || siteEnabled.indexOf('topic') > -1) {
          generalWidgets.forEach((w) => widgets.push(w.name));
        }

        if (categoryEnabled && categoryEnabled.indexOf('topic') > -1) {
          categoryWidgets.forEach((widget) => {
            if (widgets.indexOf(widget) === -1) {
              widgets.push(widget);
            }
          });
        }
      }
    }

    orderedWidgets.forEach((w) => {
      if (isNumeric(w.order)) {
        widgets.splice(w.order, 0, w.name);
      }
    });

    // 'start' & 'end' overide numbered ordering
    orderedWidgets.forEach((w) => {
      if (w.order === 'start') {
        widgets.unshift(w.name);
      }

      if (w.order === 'end') {
        widgets.push(w.name);
      }
    });

    widgets.forEach((widget) => {
      if (widget.length) {
        const exists = this.register.lookupFactory(`widget:${widget}`);

        if (exists) {
          let index = null;

          if (user && userSelectionEnabled) {
            let userIndex = userApps.indexOf(widget);

            if (userIndex > -1) {
              isUser = true;
              index = userIndex;
            }
          }

          let props = {
            topic: args.topic,
            category,
            isUser,
            editing: args.editing,
            side: args.side,
            index
          };

          if (args.customProps) {
            Object.assign(props, args.customProps);
          };

          contents.push(this.attach(widget, props));
        }
      }
    });

    return contents;
  },

  clickOutside() {
    const mobileView = this.site.mobileView;
    if (mobileView) {
      const side = this.attrs.side;
      const $sidebar = $(`.sidebar.${side}`);
      if ($sidebar.length > 0 && $sidebar.hasClass('open')) {
        toggleSidebar(side);
      }
    }
  }
});
