import { createWidget } from 'discourse/widgets/widget';

export default createWidget('sidebar', {
  tagName: 'div.sidebar',

  html(args) {
    const siteWidgets = Discourse.SiteSettings[`sidebar_${args.side}_widgets`].split('|');
    const siteEnabled = Discourse.SiteSettings[`sidebar_${args.side}_enabled`].split('|');
    let contents = [];
    let widgets = [];

    if (args.context === 'discovery') {
      let categoryEnabled = args.category ? args.category.get(`sidebar_${args.side}_enabled`) : ''
      if (!args.category || siteEnabled.indexOf('category') > -1) {
        widgets.push(...siteWidgets)
      }
      if (categoryEnabled && categoryEnabled.split('|').indexOf(args.filter) > -1) {
        args.category.get(`sidebar_${args.side}_widgets`).split('|').forEach((widget) => {
          if (widgets.indexOf(widget) === -1) {
            widgets.push(widget)
          }
        })
      }
    }

    if (args.context === 'topic' && siteEnabled.indexOf('topic') > -1) {
      widgets.push(...siteWidgets)
    }

    widgets.forEach((widget) => {
      if (widget.length) {
        contents.push(this.attach(widget, {
          topic: args.topic,
          category: args.category
        }))
      }
    })

    return contents
  }
})
