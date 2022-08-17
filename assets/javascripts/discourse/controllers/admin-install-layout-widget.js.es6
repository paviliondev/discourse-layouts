import AdminInstallTheme from "admin/controllers/modals/admin-install-theme";
import { inject as controller } from "@ember/controller";
import discourseComputed from "discourse-common/utils/decorators";
import { LAYOUTS_WIDGETS } from "../lib/layouts-widgets";
import { set } from "@ember/object";

export default AdminInstallTheme.extend({
  adminCustomizeThemes: controller("adminLayoutsWidgets"),
  themesController: controller("adminLayouts"),

  @discourseComputed("adminCustomizeThemes.installedAndAddedThemes.[]")
  themes(installedAndAddedThemes) {
    return LAYOUTS_WIDGETS.map((t) => {
      if (
        installedAndAddedThemes.some((theme) => this.themeHasSameUrl(theme, t.value))
      ) {
        set(t, "installed", true);
      }
      return t;
    });
  },

  actions: {
    addWidget(theme) {
      this.adminCustomizeThemes.send("addTheme", theme);
      this.send("closeModal");
    }
  }
});
