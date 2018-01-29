import { settingEnabled } from './settings';

let getContentWidth = (leftSidebarEnabled, rightSidebarEnabled, topic) => {
  const settings = Discourse.SiteSettings;
  let offset = 0;
  if (leftSidebarEnabled) {
    offset += settings.layouts_sidebar_left_width + 10;
  }
  if (rightSidebarEnabled) {
    offset += settings.layouts_sidebar_right_width + 10;
  }
  if (leftSidebarEnabled && !rightSidebarEnabled && topic) {
    offset += settings.layouts_sidebar_right_width + 10;
  }
  return offset > 0 ? `calc(100% - ${offset}px)` : '100%';
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

let toggleSidebar = function(side) {
  const $sidebar = $(`aside.sidebar.${side}`);
  const opposite = side === 'right' ? 'left' : 'right';
  const $oppositeToggle = $(`.mobile-toggle.${opposite}`);
  let value = 0;
  if ($sidebar.hasClass('open')) {
    value = '-90vw';
  } else {
    $oppositeToggle.hide();
  }
  let params = {}; params[side] = value;

  $sidebar.animate(params, 200, () => {
    $sidebar.toggleClass('open');
    if (!$sidebar.hasClass('open')) {
      $oppositeToggle.show();
    }
  });
};

export { getContentWidth, renderTemplateTopic, renderTemplateCategory, toggleSidebar };
