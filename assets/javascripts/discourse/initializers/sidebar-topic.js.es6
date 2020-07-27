import Sidebars from '../mixins/sidebars';
import { default as discourseComputed, observes } from 'discourse-common/utils/decorators';
import { alias } from "@ember/object/computed";
import { withPluginApi } from 'discourse/lib/plugin-api';
import{ inject as controller } from "@ember/controller";

export default {
  name: 'sidebar-topic',
  initialize(container) {
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (!siteSettings.layouts_enabled ||
        (site.mobileView && !siteSettings.layouts_mobile_enabled)) return;
    
    withPluginApi('0.8.32', api => {
      api.modifyClass('route:topic', {
        renderTemplate() {
          this.render('sidebar-wrapper');
        }
      });
      
      api.modifyClass('controller:topic', Sidebars);
      
      api.modifyClass('controller:topic', {
        mainContent: 'topic',
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
          if (hasRightSidebar) {
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
    })
  }
};
