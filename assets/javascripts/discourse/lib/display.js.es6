import { settingEnabled } from './settings';

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

var renderTemplateTopic = function(self, category, path) {
  if (!settingEnabled('layouts_list_navigation_disabled', category, path)) {
    self.render('navigation/default', { outlet: 'navigation-bar' });
  }
  self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
}

var renderTemplateCategory = function(self, category, path) {
  if (!settingEnabled('layouts_list_navigation_disabled', category, path)) {
    self.render('navigation/category', { outlet: 'navigation-bar' });
  }
  if (self._categoryList) {
    self.render('discovery/categories', { outlet: 'header-list-container', model: self._categoryList });
  }
  self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
}

export { getContentWidth, renderTemplateTopic, renderTemplateCategory }
