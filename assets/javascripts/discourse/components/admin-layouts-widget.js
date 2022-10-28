import LayoutWidget from "../models/layout-widget";
import {
  listNormalisedContexts,
  normalizeContext,
  generateDisplayName,
  lookupLayoutsWidgetSettings
} from "../lib/layouts";
import discourseComputed, { observes } from "discourse-common/utils/decorators";
import { or, not } from "@ember/object/computed";
import { computed } from "@ember/object";
import Component from "@ember/component";
import I18n from "I18n";

function buildSelectKit(items, type = null) {
  return items.map((item) => {
    let name = item;
    let id = item;

    if (["position", "widget_order"].indexOf(type) > -1 && isNaN(item)) {
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

export default Component.extend({
  classNames: "admin-layouts-widget",
  dirty: false,
  enableDisabled: or("widget.isNew", "componentDisabled"),
  componentsUrl: "/admin/layouts/components",

  positionList: computed(function () {
    return buildSelectKit(["left", "right", "center"], "position");
  }),

  @discourseComputed("widget.component.enabled")
  componentDisabled() {
    return this.widget.component && !this.widget.component.enabled;
  },

  @discourseComputed("widget.enabled", "componentDisabled")
  enabledButtonClass(enabled, componentDisabled) {
    if (componentDisabled) return "btn-danger";
    return enabled ? "btn-success" : "btn-caution";
  },

  @discourseComputed("widget.enabled", "componentDisabled")
  enabledButtonTitle(enabled, componentDisabled) {
    if (componentDisabled) return "disabled";
    return enabled ? "admin.layouts.widgets.enabled" : "admin.layouts.widgets.enable";
  },

  @discourseComputed("widget.enabled", "componentDisabled")
  enabledButtonLabel(enabled, componentDisabled) {
    if (componentDisabled) return "admin.layouts.widgets.disabled";
    return enabled ? "admin.layouts.widgets.enabled" : "admin.layouts.widgets.enable";
  },

  @discourseComputed("componentDisabled")
  widgetComponentClass(componentDisabled) {
    return componentDisabled ? "btn-danger" : "";
  },

  @discourseComputed("componentDisabled")
  widgetComponentIcon(componentDisabled) {
    return componentDisabled ? "ban" : "plug";
  },

  @discourseComputed("dirty", "widget.name", "widget.nickname", "widget.theme_id", "widget.position", "widget.contexts.[]")
  saveDisabled(dirty, name, nickname, themeId, position, contexts) {
    return !dirty || !name || !nickname || nickname.length < 3 || !themeId || !position || !contexts || contexts.length === 0;
  },

  @discourseComputed("widget.isNew")
  editDisabled(isNew) {
    return isNew;
  },

  @discourseComputed("widgets.[]", "widget.position")
  positionWidgets(widgets, position) {
    return widgets.filter(w => w.position === position);
  },

  @discourseComputed("positionWidgets")
  orderList(positionWidgets) {
    const items = ["start", "end"];
    if (positionWidgets > 0) {
      for (let i = 1; i <= positionWidgets; i++) {
        items.push(i.toString());
      }
    }
    return buildSelectKit(items, "widget_order");
  },

  contextList: computed("widget.position", function () {
    return buildSelectKit(listNormalisedContexts(this.widget.position), "context");
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
    this.set("existingWidget", JSON.parse(JSON.stringify(this.widget)));
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

  @observes('widget.nickname')
  nicknameUpdated() {
    let existingNickname = this.existingWidget.nickname || "";
    this.set("dirty", this.widget.nickname !== existingNickname);
  },

  @discourseComputed("widget.name")
  widgetDisplayName(name) {
    return generateDisplayName(name);
  },

  @discourseComputed("widget.name")
  widgetSettings(name) {
    return lookupLayoutsWidgetSettings(name);
  },

  actions: {
    updateOrder(order) {
      this.update("widget_order", order);
    },

    updatePosition(position) {
      this.update("position", position);
    },

    updateGroups(groupIds) {
      this.update("group_ids", groupIds);
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

    updateThemeId(themeId) {
      const component = this.installedComponents.find(c => c.id === themeId);
      this.update("name", component.component_name);
      this.update("theme_id", themeId);
    },

    toggle() {
      const widget = this.widget;
      const state = !widget.enabled;

      this.set("toggling", true);

      LayoutWidget.toggle(widget, state)
        .then((result) => {
          if (result.success) {
            this.widget.set("enabled", state);
          }
        })
        .finally(() => this.set("toggling", false));
    },

    save() {
      if (!this.dirty) {
        return false;
      }

      const widget = this.widget;

      if (widget.isNew && (!widget.name || !widget.theme_id)) {
        return false;
      }

      this.set("saving", true);

      LayoutWidget.save(widget)
        .then((result) => {
          if (result.widget) {
            this.setProperties({
              widget: LayoutWidget.create(result.widget),
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

      if (widget.isNew) {
        this.removeWidget(widget);
        return true;
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

    setDirty() {
      this.set("dirty", true);
    },

    edit() {
      this.toggleProperty('widget.editing');
    }
  },
});
