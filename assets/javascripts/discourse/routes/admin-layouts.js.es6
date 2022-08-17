import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  redirect() {
    this.transitionTo("adminLayouts.widgets");
  },

  model() {
    return this.store.findAll("theme");
  },

  actions: {
    showSettings() {
      const controller = this.controllerFor("adminSiteSettings");
      this.transitionTo("adminSiteSettingsCategory", "plugins").then(() => {
        controller.set("filter", "layouts");
        controller.set("_skipBounce", true);
        controller.filterContentNow("plugins");
      });
    },
  },
});
