import LayoutWidget from "../models/layout-widget";
import {
  listLayoutsWidgets,
  listNormalisedContexts,
  normalizeContext,
} from "../lib/layouts";
import discourseComputed from "discourse-common/utils/decorators";
import { not } from "@ember/object/computed";
import { computed } from "@ember/object";
import Component from "@ember/component";
import I18n from "I18n";

function buildSelectKit(items, type = null) {
  return items.map((item) => {
    let name = item;
    let id = item;

    if (["position", "order"].indexOf(type) > -1 && isNaN(item)) {
      name = I18n.t(`admin.layouts.widgets.${type}.${item}`);
    }

    if (type === "filter") {
      name = I18n.t(`filters.${item}.title`);
    }

    if (type === "context") {
      name = normalizeContext(item, { name: true });
    }

    if (["group", "category"].indexOf(type) > -1) {
      if (item === 0) {
        name = I18n.t("categories.all");
      } else {
        name = item.name;
        id = item.id;
      }
    }

    return {
      id,
      name,
    };
  });
}

function generateDisplayName(name) {
  return name
    .replace("layouts-", "")
    .replace(/[_\-]+/g, " ")
    .replace(/(^\w|\b\w)/g, (m) => m.toUpperCase());
}

export default Component.extend({
  classNames: "admin-layouts-widget",
  saveDisabled: not("dirty"),
  dirty: false,

  positionList: computed(function () {
    return buildSelectKit(["left", "right"], "position");
  }),

  @discourseComputed("widgets.length")
  orderList(widgetCount) {
    const items = ["start", "end"];
    if (widgetCount > 0) {
      for (let i = 1; i <= widgetCount; i++) {
        items.push(i.toString());
      }
    }
    return buildSelectKit(items, "order");
  },

  contextList: computed(function () {
    return buildSelectKit(listNormalisedContexts(), "context");
  }),

  filterList: computed(function () {
    return buildSelectKit(
      [...this.site.filters, "top", "categories"],
      "filter"
    );
  }),

  @discourseComputed("site.groups")
  groupList(siteGroups) {
    let list = buildSelectKit(
      siteGroups.filter((group) => {
        return group.name !== "everyone";
      }),
      "group"
    );
    return list;
  },

  @discourseComputed("site.categories")
  categoryList(siteCategories) {
    return buildSelectKit([0, ...siteCategories], "category");
  },

  didInsertElement() {
    this._super(...arguments);
    if (!this.widget.isNew) {
      this.set("existingWidget", JSON.parse(JSON.stringify(this.widget)));
    }
  },

  update(type, value) {
    this.set(`widget.${type}`, value);

    const widget = this.widget;
    if (widget.isNew) {
      this.set("dirty", !!widget.name);
    } else {
      this.set("dirty", value !== this.existingWidget[type]);
    }
  },

  @discourseComputed("widget.name")
  widgetDisplayName(name) {
    return generateDisplayName(name);
  },

  @discourseComputed
  widgetList() {
    return listLayoutsWidgets().map((name) => {
      return {
        id: name,
        name: generateDisplayName(name),
      };
    });
  },

  actions: {
    updateOrder(order) {
      this.update("order", order);
    },

    updatePosition(position) {
      this.update("position", position);
    },

    updateGroups(groups) {
      this.update("groups", groups);
    },

    updateEnabled(enabled) {
      this.update("enabled", enabled);
    },

    updateCategoryIds(categoryIds) {
      this.update("category_ids", categoryIds);
    },

    updateExcludedCategoryIds(categoryIds) {
      this.update("excluded_category_ids", categoryIds);
    },

    updateFilters(filters) {
      this.update("filters", filters);
    },

    updateContexts(contexts) {
      this.update("contexts", contexts);
    },

    updateNewWidgetName(widget) {
      this.set("widget.name", widget);
    },

    save() {
      if (!this.dirty) {
        return false;
      }

      const widget = this.widget;

      if (widget.isNew && !widget.name) {
        return false;
      }

      this.set("saving", true);

      LayoutWidget.save(widget)
        .then((result) => {
          if (result.widget) {
            this.setProperties({
              widget: result.widget,
              existingWidget: JSON.parse(JSON.stringify(result.widget)),
            });
          } else if (this.existingWidget) {
            this.set("widget", this.existingWidget);
          }

          this.set("dirty", false);
        })
        .finally(() => this.set("saving", false));
    },

    remove() {
      const widget = this.widget;
      if (!widget) {
        return false;
      }

      this.set("saving", true);
      LayoutWidget.remove(widget).then((result) => {
        if (result.success) {
          this.removeWidget(widget);
        } else {
          this.set("saving", false);
        }
      });
    },
  },
});
