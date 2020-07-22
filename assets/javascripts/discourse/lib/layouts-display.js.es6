import { settingEnabled } from './layouts-settings';

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

export {
  renderTemplateTopic,
  renderTemplateCategory
};
