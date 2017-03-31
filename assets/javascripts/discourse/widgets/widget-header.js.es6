import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('widget-header', {
  tagName: 'div.widget-header',

  html(attrs) {
    let contents = [];

    if (attrs.title) {
      contents.push(h('div.widget-title', I18n.t(attrs.title)))
    }

    contents.push(
      h('div.widget-category', this.attach('category-link', {
          category: attrs.category,
          allowUncategorized: true
       }))
    )

    return contents;
  }
})
