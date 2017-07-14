import { createWidget } from 'discourse/widgets/widget';

export default createWidget('sidebar', {
  tagName: 'div.sidebar-content',

  html(args) {
    const siteWidgets = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets`].split('|');
    const siteEnabled = Discourse.SiteSettings[`layouts_sidebar_${args.side}_enabled`].split('|');
    const pinnedTop = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets_pinned_top`].split('|');
    const pinnedBottom = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets_pinned_bottom`].split('|');
    const userSelected = Discourse.SiteSettings.layouts_sidebar_user_selected_widgets;
    const user = this.currentUser;
    let contents = [];
    let widgets = [];
    let index = null;
    let isUser = false;

    widgets.push(...pinnedTop);

    if (user && userSelected) {
      var userApps = user.get(`${args.side}_apps`) || [];
      if (userApps.length > 0) {
        widgets.push(...userApps);
      }
    } else {
      if (args.context === 'discovery' || args.context === 'tags') {
        let categoryEnabled = args.category ? args.category.get(`layouts_sidebar_${args.side}_enabled`) : '';
        if (!args.category || siteEnabled.indexOf('category') > -1) {
          widgets.push(...siteWidgets);
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
        widgets.push(...siteWidgets);
      }
    }

    if (args.editing) {
      widgets.push(...pinnedBottom);
    }

    widgets.forEach((widget) => {
      if (widget.length) {
        const exists = this.register.lookupFactory(`widget:${widget}`);

        if (exists) {
          if (user && userSelected) {
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
