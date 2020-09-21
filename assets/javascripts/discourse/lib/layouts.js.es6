import { createWidget } from 'discourse/widgets/widget';
import Sidebars from '../mixins/sidebars';
import DiscourseRoute from "discourse/routes/discourse";
import Controller from "@ember/controller";
import { withPluginApi } from 'discourse/lib/plugin-api';

function addSidebarProps(props) {
  if ($.isEmptyObject(props)) return;
  
  const container = Discourse.__container__;
  const appEvents = container.lookup("service:app-events");
  
  [
    container.lookup('controller:discovery'),
    container.lookup('controller:topic'),
    container.lookup('controller:user'),
    container.lookup('controller:tags'),
    container.lookup('controller:tag')
  ].forEach(controller => {
    controller.set(
      'customSidebarProps',
      Object.assign({}, controller.customSidebarProps, props)
    )
  });
  
  appEvents.trigger('sidebars:rerender');
}

const _layouts_widget_registry = {};
const namespace = 'layouts';

function createLayoutsWidget(name, opts) {
  const fullName = `${namespace}-${name}`;
  
  const widget = createWidget(fullName,
    Object.assign({},
      {
        tagName: `div.widget-container.${fullName}`,
        buildKey: () => fullName,
            
        shouldRender(attrs) {
          return true;
        }
      },
      opts
    )
  )
  
  _layouts_widget_registry[fullName] = widget;
    
  return widget;
}

function lookupLayoutsWidget(name) {
  return _layouts_widget_registry[name]
}

function listLayoutsWidgets() {
  return Object.keys(_layouts_widget_registry);
}

function normalizeContext(input, opts={}) {
  let map = {
    discovery: ['topics', 'discovery', 'topic list', 'Topics', "Discovery", "Topic List"],
    topic: ["topic", "Topic"],
    user: ["user", 'profile', "User", 'Profile'],
    tag: ["tag", "tags", "Tag", "Tags"]
  };
  
  let context = Object.keys(map).find((c) => map[c].includes(input));
  
  if (opts.name) {
    context = I18n.t({
      discovery: 'admin.layouts.widgets.context.discovery',
      topic: 'topic.title',
      user: 'user.profile',
      tag: 'tagging.tags'
    }[context])
  }
  
  return context;
};

function setupContext(context, app) {
  if (!app[`${context}Route`]) {
    app[`${context}Route`] = DiscourseRoute.extend();
  }
  if (!app[`${context}Controller`]) {
    app[`${context}Controller`] = Controller.extend();
  }
  
  context = context.toLowerCase();
  
  withPluginApi('0.8.32', api => {
    api.modifyClass(`route:${context}`, {
      renderTemplate() {
        this.render('sidebar-wrapper');
        this.render(context, {
          into: 'sidebar-wrapper',
          outlet: 'main-content',
          controller: context,
          model: this.modelFor(context)
        });
      }
    });
    
    api.modifyClass(`controller:${context}`, Sidebars);
    api.modifyClass(`controller:${context}`, { context });
  });
}

export {
  addSidebarProps,
  createLayoutsWidget,
  lookupLayoutsWidget,
  listLayoutsWidgets,
  normalizeContext,
  setupContext
}