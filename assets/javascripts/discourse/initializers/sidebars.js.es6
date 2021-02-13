import { default as discourseComputed, observes } from 'discourse-common/utils/decorators';
import { alias } from "@ember/object/computed";
import{ inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { readOnly } from "@ember/object/computed";
import { setupContexts } from "../lib/layouts";
import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'sidebars',
  initialize(container, app) {
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (!siteSettings.layouts_enabled ||
        (site.mobileView && !siteSettings.layouts_mobile_enabled)) return;
    
    setupContexts(app);
    
    withPluginApi('0.8.32', api => {
      api.modifyClass('controller:discovery', {
        router: service(),
        currentPath: readOnly("router.currentRouteName"),
        navigationDefault: controller("navigation/default"),
        navigationCategory: controller("navigation/category"),

        @discourseComputed(
          'navigationDefault.filterType', 
          'navigationCategory.filterType', 
          'currentPath'
        ) sidebarFilter(defaultFilter, categoryFilter, currentPath) {
          if (!currentPath) return undefined;
          let path = currentPath.toLowerCase();
          if (path.indexOf('categories') > -1) return 'categories';
          if (path.indexOf('category') > -1) return categoryFilter;
          return defaultFilter;
        }
      });
      
      api.modifyClass('controller:topic', {
        category: alias('model.category'),
        userHideRightSidebar: false
      });
      
      api.modifyClass('component:topic-navigation', {
        controller: controller('topic'),
        
        @observes('controller.hasRightSidebar')
        sidebarsUpdated() {
          this._performCheckSize();
        },
        
        _performCheckSize() {
          if (!this.element || this.isDestroying || this.isDestroyed) return;
          
          const hasRightSidebar = this.controller.get('hasRightSidebar');    
          if (hasRightSidebar && !this.info.get("topicProgressExpanded")) {
            const info = this.get('info');
            info.setProperties({
              renderTimeline: false,
              renderAdminMenuButton: true
            });
          } else {
            this._super(...arguments);
          }
        }
      });
    });
  }
};
