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

export {
  addSidebarProps
}