import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import TopicNavigation from 'discourse/components/topic-navigation';
import TopicList from 'discourse/components/topic-list';
import Topic from 'discourse/models/topic';
import Category from 'discourse/models/category';
import LayoutsFunctionality from '../mixins/layouts';
import { on, observes, default as computed } from 'ember-addons/ember-computed-decorators';
import { withPluginApi } from 'discourse/lib/plugin-api';
import { settingEnabled } from '../lib/settings';
import { getContentWidth } from '../lib/display';
import { getOwner } from 'discourse-common/lib/get-owner';

export default {
  name: 'sidebar-topic-edits',
  initialize(container){
    const site = container.lookup('site:main');
    if (site.mobileView) { return }

    const global = Discourse.SiteSettings.layouts_sidebar_left_enabled_global ||
                   Discourse.SiteSettings.layouts_sidebar_right_enabled_global;
    const joined = Discourse.SiteSettings.layouts_sidebar_left_enabled
                   .concat(' ' + Discourse.SiteSettings.layouts_sidebar_right_enabled);
    const topicSidebars = global || joined.indexOf('topic') > -1;

    if (topicSidebars) {
      Topic.reopen({
        @computed('category', 'postStream.loading')
        showTopicHeaderNavigation(category, loading) {
          return Discourse.SiteSettings.layouts_topic_header_navigation &&
                 Discourse.User.current() && !loading && (category && category.place_status !== 'founding');
        }
      });

      TopicRoute.reopen({
        renderTemplate() {
          this.render('sidebar-wrapper');
        }
      });

      TopicController.reopen(LayoutsFunctionality, {
        mainContent: 'topic',
        category: Ember.computed.alias('model.category'),

        @computed('path')
        leftSidebarEnabled() {
          const select = Discourse.SiteSettings.layouts_sidebar_left_enabled.split('|');
          const global = Discourse.SiteSettings.layouts_sidebar_left_enabled_global;
          return global || select.indexOf('topic') > -1;
        },

        @computed('path')
        rightSidebarEnabled() {
          const select = Discourse.SiteSettings.layouts_sidebar_right_enabled.split('|');
          const global = Discourse.SiteSettings.layouts_sidebar_right_enabled_global;
          return global || select.indexOf('topic') > -1;
        },

        @computed('path')
        mainStyle() {
          const left = this.get('leftSidebarEnabled');
          const right = this.get('rightSidebarEnabled');
          let width = getContentWidth(left, right, true);
          let style = `width: ${width};`
          if (left && !right) {
            style += ` margin-right: ${Discourse.SiteSettings.layouts_sidebar_right_width}px;`;
          }
          return Ember.String.htmlSafe(style);
        },

        @computed('path', 'editingSidebars')
        mainClasses(path, editing) {
          const left = this.get('leftSidebarEnabled');
          const right = this.get('rightSidebarEnabled');
          let classes = 'topic';

          if (left || right) classes += ' has-sidebars';
          if (left) classes += ' left-sidebar';
          if (right) classes += ' right-sidebar';
          if (editing) classes += ' editing';

          return classes;
        }
      });

      // disables the topic timeline when right sidebar enabled in topics
      if (Discourse.SiteSettings.layouts_sidebar_right_enabled.indexOf('topic') > -1) {
        TopicNavigation.reopen({
          _performCheckSize() {
            if (!this.element || this.isDestroying || this.isDestroyed) return;

            const info = this.get('info');
            info.setProperties({
              renderTimeline: false,
              renderAdminMenuButton: true
            });
          }
        })
      }

      withPluginApi('0.1', api => {
        api.changeWidgetSetting('post-avatar', 'size', 'medium');
      })
    }

    TopicList.reopen({
      @computed()
      skipHeader(){
        const headerDisabled = getOwner(this).lookup('controller:discovery').get('headerDisabled');
        return this.site.mobileView || headerDisabled;
      }
    })
  }
}
