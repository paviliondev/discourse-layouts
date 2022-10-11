import EmberObject, { set } from "@ember/object";
import Controller, { inject as controller }  from "@ember/controller";
import showModal from "discourse/lib/show-modal";
import { LAYOUTS_WIDGETS, findTheme } from "../lib/layouts-widgets";
import { listLayoutsWidgets, generateDisplayName } from "../lib/layouts";
import discourseComputed from "discourse-common/utils/decorators";
import LayoutWidget from "../models/layout-widget";
import { A } from "@ember/array";

export default Controller.extend({
  addedThemes: A(),
  themesController: controller("adminLayouts"),

  @discourseComputed("themesController.installedThemes", "addedThemes.[]")
  installedAndAddedThemes(installedThemes, addedThemes) {
    return [...installedThemes, ...addedThemes.toArray()];
  },

  @discourseComputed
  loadedLayoutsWidgets() {
    return listLayoutsWidgets();
  },

  @discourseComputed('addedThemes.[]')
  addedLayoutsWidgets(addedThemes) {
    return addedThemes.toArray().map(w => w.layouts_id);
  },

  @discourseComputed('loadedLayoutsWidgets', 'addedLayoutsWidgets')
  widgetList(loadedWidgets, addedWidgets) {
    const widgets = [...loadedWidgets, ...addedWidgets];
    return widgets.map((layouts_id) => {
      return {
        id: layouts_id,
        name: generateDisplayName(layouts_id),
      };
    });
  },

  actions: {
    addWidget() {
      showModal("admin-install-layout-widget");
    },

    addTheme(theme) {
      let widget;

      if (theme.remote_theme) {
        // Theme was installed.
        LAYOUTS_WIDGETS.forEach(w => {
          if (theme.remote_theme.remote_url === w.value) {
            widget = w;
          }
        });
      } else {
        // Theme was already installed.
        widget = theme;
        theme = findTheme(this.installedAndAddedThemes, widget);
      }

      set(theme, "layouts_id", widget.layouts_id);

      if (!this.loadedLayoutsWidgets.includes(theme.layouts_id)) {
        this.addedThemes.pushObject(theme);
      }

      this.get("widgets").unshiftObject(
        LayoutWidget.create({
          id: "new",
          editing: true,
          name: theme.layouts_id,
          nickname: I18n.t("admin.layouts.widgets.default_nickname", { name: generateDisplayName(theme.layouts_id) }),
          theme_id: theme.id
        })
      );
    },

    removeWidget(widget) {
      this.get("widgets").removeObject(widget);
    },
  },
});
