import { createWidget } from "discourse/widgets/widget";
import { lookupLayoutsWidget, normalizeContext } from "../lib/layouts";

export default createWidget("layouts-widgets", {
  tagName: "div.widgets-content",

  html(args) {
    let {
      position,
      context,
      controller,
      path,
      filter,
      category,
      topic,
      customSidebarProps,
      tabletView,
      mobileView,
      sidebarMinimized,
    } = args;

    let siteWidgets = this.site.layout_widgets || [];

    context = normalizeContext(context);

    let props = {
      topic,
      category,
      position,
      path,
      mobileView,
      tabletView,
      sidebarMinimized,
    };

    if (customSidebarProps) {
      Object.keys(customSidebarProps).forEach((p) => {
        props[p] = customSidebarProps[p];
      });
    }

    let widgets = siteWidgets
      .filter((w) => {
        if (
          !this.widgetExists(w.name) ||
          !w.enabled ||
          w.position !== position ||
          w.contexts.indexOf(context) === -1 ||
          (!category && w.category_ids.length) ||
          (category &&
            w.category_ids.length &&
            w.category_ids
              .map((id) => Number(id))
              .filter((id) => {
                return (
                  Number(category.id) === id ||
                  Number(category.parent_category_id) === id
                );
              }).length === 0) ||
          (category &&
            w.excluded_category_ids &&
            w.excluded_category_ids.length &&
            w.excluded_category_ids
              .map((id) => Number(id))
              .some((id) => {
                return (
                  Number(category.id) === id ||
                  Number(category.parent_category_id) === id
                );
              })) ||
          (context === "discovery" &&
            w.filters &&
            w.filters.length &&
            w.filters.indexOf(filter) === -1)
        ) {
          return false;
        } else {
          let LayoutsWidgetClass = this.lookupWidgetClass(w.name);
          return (
            LayoutsWidgetClass &&
            LayoutsWidgetClass.prototype.shouldRender(props)
          );
        }
      })
      .sort(function (a, b) {
        if (a.widget_order === b.widget_order) {
          return 0;
        }
        if (a.widget_order === "start") {
          return -1;
        }
        if (a.widget_order === "end" || b.widget_order === "start") {
          return 1;
        }
        return Number(a.widget_order) - Number(b.widget_order);
      });

    let contents = [];

    if (widgets.length > 0) {
      widgets.forEach((w) => {
        let wProps = Object.assign({}, w.settings, { widget_id: w.id });
        contents.push(this.attach(w.name, Object.assign({}, props, wProps)));
      });
    }

    controller.send("setWidgets", position, widgets);

    return contents;
  },

  clickOutside() {
    this.appEvents.trigger("sidebar:toggle", {
      position: this.attrs.position,
      value: false,
      target: "mobile",
    });
  },

  widgetExists(widgetName) {
    return (
      lookupLayoutsWidget(widgetName) ||
      this.register.lookupFactory(`widget:${widgetName}`)
    );
  },
});
