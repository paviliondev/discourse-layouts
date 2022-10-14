import Component from "@ember/component";
import LayoutComponent from "../models/layout-component";

export default Component.extend({
  classNames: "admin-layouts-component",

  actions: {
    install() {
      const component = this.layoutComponent;

      if (component.installed) {
        return;
      }

      this.set('installing', true);

      LayoutComponent.install(component.url).then(result => {
        if (result.theme) {
          component.setProperties({
            installed: true,
            theme_id: result.theme.id,
            theme_name: result.theme.name
          });
        }
      }).finally(() => this.set('installing', false));
    },
  }
});
