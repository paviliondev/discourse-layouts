import { createWidget } from "discourse/widgets/widget";
import Sidebars from "../mixins/sidebars";
import { withPluginApi } from "discourse/lib/plugin-api";
import { dasherize } from "@ember/string";
import I18n from "I18n";
import deprecated from "discourse-common/lib/deprecated";

const layoutsNamespace = "layouts";
const PLUGIN_ID = "discourse-layouts";

const contexts = [
  "discovery",
  "topic",
  "user",
  "users",
  "tags-index",
  {
    name: "tag-show",
    template: "tag-show",
  },
  "groups-index",
  "groups-new",
  "group",
  {
    name: "badges-index",
    route: "badges-index",
    controller: "badges/index",
  },
  {
    name: "badges-show",
    route: "badges-show",
    controller: "badges/show",
  },
  "review",
  "admin",
  {
    name: "search",
    route: "full-page-search",
    controller: "full-page-search",
    template: "full-page-search",
  },
];

function addSidebarProps(props, container = null) {
  if ($.isEmptyObject(props)) {
    return;
  }

  if (!container) {
    deprecated(
      "you must pass 'container' as a second argument to addSidebarProps",
      {
        dropFrom: "3.0.0",
      }
    );
  }

  // eslint-disable-next-line no-undef
  container = container || Discourse.__container__;
  const appEvents = container.lookup("service:app-events");

  contexts.forEach((context) => {
    const controllerName = contextAttr(context, "controller");
    const controller = container.lookup(`controller:${controllerName}`);

    if (controller) {
      controller.set(
        "customSidebarProps",
        Object.assign({}, controller.customSidebarProps, props)
      );
    }
  });

  appEvents.trigger("sidebars:rerender");
}

const _layouts_widget_registry = {};
const namespace = "layouts";

function createLayoutsWidget(name, opts) {
  const fullName = `${namespace}-${name}`;

  const widget = createWidget(
    fullName,
    Object.assign(
      {},
      {
        tagName: `div.widget-container.${fullName}`,
        buildKey: () => fullName,

        // eslint-disable-next-line no-unused-vars
        shouldRender(attrs) {
          return true;
        },
      },
      opts
    )
  );

  _layouts_widget_registry[fullName] = widget;

  return widget;
}

function lookupLayoutsWidget(name) {
  return _layouts_widget_registry[name];
}

function listLayoutsWidgets() {
  return Object.keys(_layouts_widget_registry);
}

function normalizeContext(input, opts = {}) {
  let map = {
    discovery: [
      "topics",
      "discovery",
      "topic list",
      "Topics",
      "Discovery",
      "Topic List",
    ],
    topic: ["topic", "Topic"],
    user: ["user", "profile", "User", "Profile"],
    users: ["users"],
    tag: ["tag", "tags", "Tag", "Tags", "tags-index", "tag-show"],
    group: ["group", "groups-index", "groups-new"],
    badge: ["badge", "badges-index", "badges-show"],
    review: ["review"],
    admin: ["admin"],
    search: ["search"],
  };

  let context = Object.keys(map).find((c) => map[c].includes(input));

  if (opts.name) {
    context = I18n.t(
      {
        discovery: "admin.layouts.widgets.context.discovery",
        topic: "topic.title",
        user: "user.profile",
        users: "user.users",
        tag: "tagging.tags",
        group: "groups.title.one",
        badge: "admin.badges.badge",
        review: "review.title",
        admin: "admin_title",
        search: "search.search_button",
      }[context]
    );
  }

  return context;
}

function setupContexts() {
  contexts.forEach((context) => {
    setupContext(context);
  });
}

function contextAttr(context, attr) {
  let result;

  if (typeof context === "object") {
    if (context[attr]) {
      result = context[attr];
    } else {
      result = context["name"];
    }
  } else {
    result = context;
  }

  if (attr === "template") {
    result = result.replace(/-/g, ".");
  }

  return result;
}

function getAttrFromContext(contextName, attr) {
  let result;

  contexts.some((context) => {
    if (contextAttr(context, "name") === contextName) {
      result = contextAttr(context, attr);
      return true;
    }
  });

  return result;
}

function isCamelCase(value) {
  return /[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/.test(value);
}

function getContextFromAttr(value, attr) {
  let result;

  if (attr === "route") {
    if (isCamelCase(value)) {
      value = dasherize(value);
    } else if (value.indexOf(".") !== -1) {
      value = value.replace(/\./g, "-");
    }
  }

  contexts.some((context) => {
    let contextValue = contextAttr(context, attr);
    if (contextValue === value) {
      result = contextValue;
      return true;
    }
  });

  return result;
}

function listNormalisedContexts() {
  return contexts.map((context) =>
    normalizeContext(contextAttr(context, "name"))
  );
}

function setupContext(context) {
  const name = contextAttr(context, "name");
  const route = contextAttr(context, "route");
  const controller = contextAttr(context, "controller");
  const template = contextAttr(context, "template");
  const model = contextAttr(context, "model");

  withPluginApi("0.8.32", (api) => {
    const currentUser = api.getCurrentUser();

    if (!((!currentUser || currentUser.admin === false) && route === "admin")) {
      api.modifyClass(`route:${route}`, {
        pluginId: PLUGIN_ID,

        renderTemplate() {
          this.render("sidebar-wrapper");
          this.render(template, {
            into: "sidebar-wrapper",
            outlet: "main-content",
            controller,
            model: this.modelFor(model),
          });
        },
      });

      let controllerClass = `controller:${controller}`;
      let controllerExists = api._resolveClass(controllerClass);

      if (controllerExists) {
        const klass = api._resolveClass(controllerClass, {});
        klass.class.reopen(Sidebars);
        api.modifyClass(controllerClass, {
          pluginId: PLUGIN_ID,
          layouts_context: name,
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn("Layouts context is missing a controller: ", name);
      }
    }
  });
}

export {
  addSidebarProps,
  createLayoutsWidget,
  lookupLayoutsWidget,
  listLayoutsWidgets,
  normalizeContext,
  setupContexts,
  getAttrFromContext,
  getContextFromAttr,
  listNormalisedContexts,
  layoutsNamespace,
};
