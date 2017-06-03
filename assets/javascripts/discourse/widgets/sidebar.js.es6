import { createWidget } from 'discourse/widgets/widget';

export default createWidget('sidebar', {
  tagName: 'div.sidebar',

  html(args) {
    const siteWidgets = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets`].split('|');
    const siteEnabled = Discourse.SiteSettings[`layouts_sidebar_${args.side}_enabled`].split('|');
    const pinnedTop = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets_pinned_top`].split('|');
    const pinnedBottom = Discourse.SiteSettings[`layouts_sidebar_${args.side}_widgets_pinned_bottom`].split('|');
    const userSelected = Discourse.SiteSettings.layouts_sidebar_user_selected_widgets;
    let contents = [];
    let widgets = [];

    widgets.push(...pinnedTop);

    if (userSelected) {
      const userApps = this.currentUser.apps;
      if (userApps && userApps.length > 0) {
        let userAppNames = userApps.map((a) => a.name);
        widgets.push(...userAppNames)
      }
    } else {
      if (args.context === 'discovery' || args.context === 'tags') {
        let categoryEnabled = args.category ? args.category.get(`layouts_sidebar_${args.side}_enabled`) : ''
        if (!args.category || siteEnabled.indexOf('category') > -1) {
          widgets.push(...siteWidgets)
        }
        if (categoryEnabled && categoryEnabled.split('|').indexOf(args.filter) > -1) {
          args.category.get(`layouts_sidebar_${args.side}_widgets`).split('|').forEach((widget) => {
            if (widgets.indexOf(widget) === -1) {
              widgets.push(widget)
            }
          })
        }
      }
      if (args.context === 'topic' && siteEnabled.indexOf('topic') > -1) {
        widgets.push(...siteWidgets)
      }
    }

    widgets.push(...pinnedBottom);

    widgets.forEach((widget) => {
      if (widget.length) {
        const exists = this.register.lookupFactory(`widget:${widget}`);
        if (exists) {
          contents.push(this.attach(widget, {
            topic: args.topic,
            category: args.category
          }))
        }
      }
    })

    return contents
  }
})
