import { settingEnabled } from './settings';

let mainStyle = (leftSidebarEnabled, rightSidebarEnabled, isTopic) => {
  const settings = Discourse.SiteSettings;

  let offset = 0;
  let style = '';

  if (leftSidebarEnabled) {
    offset += settings.layouts_sidebar_left_width + 10;
  }
  if (rightSidebarEnabled) {
    offset += settings.layouts_sidebar_right_width + 10;
  }
  if (leftSidebarEnabled && !rightSidebarEnabled && isTopic) {
    offset += settings.layouts_sidebar_right_width + 10;
    style += `margin-right: ${Discourse.SiteSettings.layouts_sidebar_right_width}px;`;
  }

  style += `width: ${offset > 0 ? `calc(100% - ${offset}px)` : '100%'}`;

  return style;
};

let renderTemplateTopic = function(self, category, path) {
  if (!settingEnabled('layouts_list_navigation_disabled', category, path)) {
    self.render('navigation/default', { outlet: 'navigation-bar' });
  }
  self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
};

let renderTemplateCategory = function(self, category, path) {
  if (!settingEnabled('layouts_list_navigation_disabled', category, path)) {
    self.render('navigation/category', { outlet: 'navigation-bar' });
  }
  if (self._categoryList) {
    self.render('discovery/categories', { outlet: 'header-list-container', model: self._categoryList });
  }
  self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
};

let responsiveSidebarWidth = function(side) {
  const sidebarWidthSetting = Discourse.SiteSettings[`layouts_sidebar_${side}_width`];
  const windowBasedWidth = $(window).width() * 0.85;
  return windowBasedWidth < sidebarWidthSetting ? windowBasedWidth : sidebarWidthSetting;
};

export { mainStyle, renderTemplateTopic, renderTemplateCategory, responsiveSidebarWidth };
