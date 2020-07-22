import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import TopicNavigation from 'discourse/components/topic-navigation';
import TopicList from 'discourse/components/topic-list';
import Sidebars from '../mixins/sidebars';
import { default as discourseComputed, observes, on } from 'discourse-common/utils/decorators';
import { settingEnabled } from '../lib/layouts-settings';
import { alias } from "@ember/object/computed";
import { withPluginApi } from 'discourse/lib/plugin-api';

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
      
      api.modifyClass('controller:topic', {
        mainContent: 'topic',
        category: alias('model.category'),
        isTopic: true
      });
      
      api.modifyClass('controller:topic', Sidebars);
      
      api.modifyClass('component:topic-navigation', {
        _performCheckSize() {
          if (!this.element || this.isDestroying || this.isDestroyed) return;

          if (settingEnabled('layouts_sidebar_right_enabled', this.get('topic.category'), 'topic')) {
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
      
      const discoveryController = container.lookup('controller:discovery');
      
      api.modifyClass('component:topic-list', {
        @discourseComputed()
        skipHeader(){
          return site.mobileView || discoveryController.get('headerDisabled');
        }
      });
    })
  }
};
