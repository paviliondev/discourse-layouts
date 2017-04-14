var getContentWidth = (leftSidebarEnabled, rightSidebarEnabled, topic) => {
  const settings = Discourse.SiteSettings;
  let offset = 0
  if (leftSidebarEnabled) {
    offset += settings.layouts_sidebar_left_width + 15
  }
  if (rightSidebarEnabled) {
    offset += settings.layouts_sidebar_right_width + 15
  }
  if (leftSidebarEnabled && !rightSidebarEnabled && topic) {
    offset += settings.layouts_sidebar_right_width + 15
  }
  return offset > 0 ? `calc(100% - ${offset}px)` : '100%'
}

export { getContentWidth }
