import { createWidget } from 'discourse/widgets/widget';
import Sidebars from '../mixins/sidebars';
import DiscourseRoute from "discourse/routes/discourse";
import Controller from "@ember/controller";
import { withPluginApi } from 'discourse/lib/plugin-api';

const contexts = [
  'discovery',
  'topic',
  'user',
  'tags-index',
  {
    name: 'tag-show',
    template: 'tags-show'
  }
]

function addSidebarProps(props) {
  if ($.isEmptyObject(props)) return;
  
  const container = Discourse.__container__;
  const appEvents = container.lookup("service:app-events");
  
  contexts.forEach(context => {
    const controller = container.lookup(`controller:${context}`);
    
    if (controller) {
      controller.set(
        'customSidebarProps',
        Object.assign({}, controller.customSidebarProps, props)
      )
    }
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
    tag: ["tag", "tags", "Tag", "Tags", "tags-index", "tag-show"]
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

function setupContexts(app) {
  contexts.forEach(context => {
    setupContext(context, app);
  })
}

function contextAttr(context, attr) {
  let result;
  
  if (typeof context === 'object') {
    if (context[attr]) {
      result = context[attr];
    } else {
      result = context['name'];
    }
  } else {
    result = context;
  }
  
  if (attr === 'template') {
    result = result.replace(/-/g, '.');
  }
  
  return result;
}

function setupContext(context, app) {
  const name = contextAttr(context, 'name');
  const route = contextAttr(context, 'route');
  const controller = contextAttr(context, 'controller');
  const template = contextAttr(context, 'template');
  const model = contextAttr(context, 'model');
  
  
  withPluginApi('0.8.32', api => {
    api.modifyClass(`route:${route}`, {
      renderTemplate() {
        this.render('sidebar-wrapper');
        this.render(template, {
          into: 'sidebar-wrapper',
          outlet: 'main-content',
          controller,
          model: this.modelFor(model)
        });
      }
    });
    
    api.modifyClass(`controller:${controller}`, Sidebars);
    api.modifyClass(`controller:${controller}`, { context: name });
  });
}

export {
  addSidebarProps,
  createLayoutsWidget,
  lookupLayoutsWidget,
  listLayoutsWidgets,
  normalizeContext,
  setupContexts
}