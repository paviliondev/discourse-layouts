import ApplicationController from 'discourse/controllers/application';
import DiscoveryController from 'discourse/controllers/discovery';
import DiscoveryRoute from 'discourse/routes/discovery';
import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import TopicNavigation from 'discourse/components/topic-navigation';
import TopicList from 'discourse/components/topic-list';
import ShowModal from 'discourse/lib/show-modal';
import EditCategorySettings from 'discourse/components/edit-category-settings';
import ButtonComponent from 'discourse/components/d-button';
import { on, observes, default as computed } from 'ember-addons/ember-computed-decorators';
import { withPluginApi } from 'discourse/lib/plugin-api';
import { settingEnabled } from '../helpers/settings';
import { getOwner } from 'discourse-common/lib/get-owner';

const getContentWidth = (leftSidebarEnabled, rightSidebarEnabled, topic) => {
  const settings = Discourse.SiteSettings;
  let offset = 0
  if (leftSidebarEnabled) {
    offset += settings.sidebar_left_width + 15
  }
  if (rightSidebarEnabled) {
    offset += settings.sidebar_right_width + 15
  }
  if (leftSidebarEnabled && !rightSidebarEnabled && topic) {
    offset += settings.sidebar_right_width + 15
  }
  return offset > 0 ? `calc(100% - ${offset}px)` : '100%'
}

export default {
  name: 'sidebar-edits',
  initialize(container){

    DiscoveryRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    DiscoveryController.reopen({
      mainContent: 'discovery',
      path: Ember.computed.alias('application.currentPath'),

      @on('init')
      @observes('path')
      discoveryDomEdits() {
        if (!this.get('path')) { return }

        // text hidden by default to avoid 'flicker' on render
        if (!this.get('btnLabelsDisabled')) {
          Ember.run.schedule('afterRender', this, () => {
            const listButton = $('.list-controls button');
            listButton.css({
              'font-size': '1.143em',
              'width': 'initial',
              'height': 'initial'
            })
            listButton.find('.fa').css({
              'font-size': 'initial',
              'line-height': 'initial'
            })
            listButton.find('span').css('display', 'inline-block')
          })
        }
        // necessary because discovery categories component does not use skipHeader
        if (this.get('headerDisabled')) {
          Ember.run.scheduleOnce('afterRender', function() {
            $('.main-content thead').hide()
          })
        }

        if (this.get('path').indexOf('categories') > -1) {
          this.set('filterMode', 'categories')
        }
      },

      @computed('path')
      leftSidebarEnabled() {
        return settingEnabled('sidebar_left_enabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      rightSidebarEnabled() {
        return settingEnabled('sidebar_right_enabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      navigationDisabled() {
        return settingEnabled('sidebar_list_navigation_disabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      headerDisabled() {
        return settingEnabled('sidebar_list_header_disabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      btnLabelsDisabled() {
        return settingEnabled('sidebar_list_btn_labels_disabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      mainStyle() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        return `width: ${getContentWidth(left, right)};`;
      },

      @computed('path', 'loading')
      mainClasses() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        const navigationDisabled = this.get('navigationDisabled');
        const headerDisabled = this.get('headerDisabled');
        let classes = 'discovery';

        if (this.get('loading')) {
          return classes + ' loading'
        }
        if (left || right) {
          classes += ' has-sidebars'
        }
        if (left) {
          classes += ' left-sidebar'
        }
        if (right) {
          classes += ' right-sidebar'
        }
        if (navigationDisabled) {
          classes += ' navigation-disabled'
        }
        if (headerDisabled) {
          classes += ' header-disabled'
        }
        return classes
      }
    });

    const joined = Discourse.SiteSettings.sidebar_left_enabled
                   .concat(' ' + Discourse.SiteSettings.sidebar_right_enabled);
    const topicSidebars = joined.indexOf('topic') > -1;

    if (topicSidebars) {
      TopicRoute.reopen({
        renderTemplate() {
          this.render('sidebar-wrapper');
        }
      });

      TopicController.reopen({
        mainContent: 'topic',

        @computed('application.currentPath')
        leftSidebarEnabled() {
          return Discourse.SiteSettings.sidebar_left_enabled.split('|').indexOf('topic') > -1
        },

        @computed('application.currentPath')
        rightSidebarEnabled() {
          return Discourse.SiteSettings.sidebar_right_enabled.split('|').indexOf('topic') > -1
        },

        @computed('application.currentPath')
        mainStyle() {
          const left = this.get('leftSidebarEnabled');
          const right = this.get('rightSidebarEnabled');
          let width = getContentWidth(left, right, true);
          let style = `width: ${width};`
          if (left && !right) {
            style += ` margin-right: ${Discourse.SiteSettings.sidebar_right_width}px;`
          }
          return style
        },

        @computed('application.currentPath')
        mainClasses() {
          const left = this.get('leftSidebarEnabled');
          const right = this.get('rightSidebarEnabled');
          let classes = 'topic'

          if (left || right) {
            classes += ' has-sidebars'
          }
          if (left) {
            classes += ' left-sidebar'
          }
          if (right) {
            classes += ' right-sidebar'
          }
          return classes
        }
      });

      // disables the topic timeline when right sidebar enabled in topics
      if (Discourse.SiteSettings.sidebar_right_enabled.indexOf('topic') > -1) {
        TopicNavigation.reopen({
          _performCheckSize() {
            if (!this.element || this.isDestroying || this.isDestroyed) { return; }
            const info = this.get('info');
            info.setProperties({
              renderTimeline: false,
              renderAdminMenuButton: true
            });
          }
        })
      }

      withPluginApi('0.1', api => {
        api.changeWidgetSetting('post-avatar', 'size', 'medium')
      })
    }

    TopicList.reopen({
      skipHeader: function() {
        const path = getOwner(this).lookup('controller:application').get('currentPath');
        let disabled = settingEnabled('sidebar_list_header_disabled', this.get('category'), path);
        return this.site.mobileView || disabled
      }.property()
    });

    EditCategorySettings.reopen({
      leftChoices: Ember.A(),
      rightChoices: Ember.A()
    })
  }
}
