import { createWidget } from 'discourse/widgets/widget';

function addSidebarProps(props) {
  if ($.isEmptyObject(props)) return;
  
  const container = Discourse.__container__;
  const appEvents = container.lookup("service:app-events");
  
  [
    container.lookup('controller:discovery'),
    container.lookup('controller:topic'),
    container.lookup('controller:user')
  ].forEach(controller => {
    controller.set(
      'customSidebarProps',
      Object.assign({}, controller.customSidebarProps, props)
    )
  });
  
  appEvents.trigger('sidebars:rerender');
}

const _layouts_widget_registry = {};

function createLayoutsWidget(name, opts) {
  const fullName = `layouts-${name}`;
  
  const widget = createWidget(fullName,
    Object.assign({},
      {
        tagName: `div.widget-container.${fullName}`,
        buildKey: () => fullName,
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

export {
  addSidebarProps,
  createLayoutsWidget,
  lookupLayoutsWidget,
  listLayoutsWidgets
}