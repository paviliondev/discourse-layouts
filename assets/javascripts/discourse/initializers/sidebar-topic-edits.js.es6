import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import TopicNavigation from 'discourse/components/topic-navigation';
import TopicList from 'discourse/components/topic-list';
import Sidebars from '../mixins/sidebars';
import { default as computed } from 'ember-addons/ember-computed-decorators';
import { settingEnabled } from '../lib/settings';
import { getOwner } from 'discourse-common/lib/get-owner';

export default {
  name: 'sidebar-topic-edits',
  initialize(container){
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (site.mobileView && !siteSettings.layouts_mobile_enabled || !siteSettings.layouts_enabled) { return; }

    TopicRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    TopicController.reopen(Sidebars, {
      mainContent: 'topic',
      category: Ember.computed.alias('model.category'),
      isTopic: true
    });

    // disables the topic timeline when right sidebar enabled in topics
    TopicNavigation.reopen({
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

    TopicList.reopen({
      @computed()
      skipHeader(){
        const headerDisabled = getOwner(this).lookup('controller:discovery').get('headerDisabled');
        return this.site.mobileView || headerDisabled;
      }
    });
  }
};
