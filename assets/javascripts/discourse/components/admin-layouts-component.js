import Component from "@ember/component";
import LayoutComponent from "../models/layout-component";

export default Component.extend({
  classNames: "admin-layouts-component",

  actions: {
    updateThemeId(themeId) {
      this.layoutComponent.set('theme_id', themeId);
    },

    createComponent() {
      const layoutComponent = this.layoutComponent;
      const component = {
        id: "new",
        name: layoutComponent.name,
        nickname: layoutComponent.nickname,
        description: layoutComponent.description,
        theme_id: layoutComponent.theme_id
      }

      this.set("loading", true);

      LayoutComponent.createComponent(component).then(result => {
        if (result.component) {
          this.updateComponent(layoutComponent, LayoutComponent.create(result.component));
        }
      }).finally(() => this.set('loading', false));
    },

    removeComponent() {
      const layoutComponent = this.layoutComponent;

      this.set('loading', true);

      LayoutComponent.removeComponent(layoutComponent).then(result => {
        if (result.success) {
          this.removeComponent(layoutComponent);
        }
      }).finally(() => this.set('loading', false));
    },

    installComponent() {
      const component = this.layoutComponent;

      if (component.theme_id) {
        return;
      }

      this.set('loading', true);

      LayoutComponent.installComponent(component.url).then(result => {
        if (result.component) {
          this.updateComponent(component, LayoutComponent.create(result.component));
        }
      }).finally(() => this.set('loading', false));
    },
  }
});
