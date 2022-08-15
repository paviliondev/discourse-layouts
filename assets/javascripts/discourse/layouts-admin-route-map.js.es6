export default {
  resource: "admin",
  map() {
    this.route(
      "adminLayouts",
      { path: "/layouts", resetNamespace: true },
      function () {
        this.route("widgets", { path: "/widgets" });
      }
    );
  },
};
