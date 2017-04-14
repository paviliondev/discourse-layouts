import ApplicationController from 'discourse/controllers/application';
import DiscoveryController from 'discourse/controllers/discovery';
import DiscoveryRoute from 'discourse/routes/discovery';
import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import TopicNavigation from 'discourse/components/topic-navigation';
import TopicList from 'discourse/components/topic-list';
import TagsShowRoute from 'discourse/routes/tags-show';
import TagsShowController from 'discourse/controllers/tags-show';
import ShowModal from 'discourse/lib/show-modal';
import NavigationBar from 'discourse/components/navigation-bar';
import NavigationItem from 'discourse/components/navigation-item';
import { on, observes, default as computed } from 'ember-addons/ember-computed-decorators';
import { withPluginApi } from 'discourse/lib/plugin-api';
import { settingEnabled } from '../helpers/settings';
import { getOwner } from 'discourse-common/lib/get-owner';

const getContentWidth = (leftSidebarEnabled, rightSidebarEnabled, topic) => {
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

export default {
  name: 'sidebar-edits',
  initialize(container){
    const site = container.lookup('site:main');
    if (site.mobileView) { return }

    DiscoveryRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    DiscoveryController.reopen({
      mainContent: 'discovery',
      path: Ember.computed.alias('application.currentPath'),
      navigationDefault: Ember.inject.controller('navigation/default'),
      navigationCategories: Ember.inject.controller("navigation/categories"),

      @on('init')
      @observes('path')
      discoveryDomEdits() {
        const path = this.get('path')
        if (!path || path === 'discovery.loading') { return }

        // necessary because discovery categories component does not use skipHeader
        if (this.get('headerDisabled')) {
          Ember.run.scheduleOnce('afterRender', function() {
            $('.main-content thead').hide()
          })
        }
      },

      @computed('navigationDefault.filterMode', 'navigationCategory.filterMode')
      filter() {
        let filterMode = this.get('navigationDefault.filterMode') || this.get('navigationCategory.filterMode'),
            filterArr = filterMode ? filterMode.split('/') : [];
        return filterArr[filterArr.length - 1]
      },

      @computed('path')
      leftSidebarEnabled() {
        return settingEnabled('layouts_sidebar_left_enabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      rightSidebarEnabled() {
        return settingEnabled('layouts_sidebar_right_enabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      navigationDisabled() {
        return settingEnabled('layouts_list_navigation_disabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      headerDisabled() {
        return settingEnabled('layouts_list_header_disabled', this.get('category'), this.get('path'))
      },

      @computed('path')
      navMenuEnabled() {
        return settingEnabled('layouts_list_nav_menu', this.get('category'), this.get('path'))
      },

      @computed('category')
      showCategoryEditBtn() {
        const category = this.get('category');
        return category && category.get('can_edit') && this.get('navigationDisabled');
      },

      @computed('path')
      mainStyle() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        return Ember.String.htmlSafe(`width: ${getContentWidth(left, right)};`);
      },

      @computed('path')
      leftStyle() {
        return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
      },

      @computed('path')
      rightStyle() {
        return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
      },

      @computed('path', 'loading')
      mainClasses() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
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
        if (this.get('navigationDisabled')) {
          classes += ' navigation-disabled'
        }
        if (this.get('headerDisabled')) {
          classes += ' header-disabled'
        }
        if (this.get('navMenuEnabled')) {
          classes += ' nav-menu-enabled'
        }
        return classes
      }
    });

    const joined = Discourse.SiteSettings.layouts_sidebar_left_enabled
                   .concat(' ' + Discourse.SiteSettings.layouts_sidebar_right_enabled);
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
          return Discourse.SiteSettings.layouts_sidebar_left_enabled.split('|').indexOf('topic') > -1
        },

        @computed('application.currentPath')
        rightSidebarEnabled() {
          return Discourse.SiteSettings.layouts_sidebar_right_enabled.split('|').indexOf('topic') > -1
        },

        @computed('application.currentPath')
        mainStyle() {
          const left = this.get('leftSidebarEnabled');
          const right = this.get('rightSidebarEnabled');
          let width = getContentWidth(left, right, true);
          let style = `width: ${width};`
          if (left && !right) {
            style += ` margin-right: ${Discourse.SiteSettings.layouts_sidebar_right_width}px;`
          }
          return Ember.String.htmlSafe(style);
        },

        @computed('path')
        leftStyle() {
          return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
        },

        @computed('path')
        rightStyle() {
          return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
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
      if (Discourse.SiteSettings.layouts_sidebar_right_enabled.indexOf('topic') > -1) {
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
        const headerDisabled = getOwner(this).lookup('controller:discovery').get('headerDisabled');
        return this.site.mobileView || headerDisabled
      }.property()
    });

    TagsShowRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    TagsShowController.reopen({
      mainContent: 'tags/show',

      @computed('application.currentPath')
      leftSidebarEnabled() {
        return Discourse.SiteSettings.layouts_sidebar_left_enabled.split('|').indexOf('tags') > -1
      },

      @computed('application.currentPath')
      rightSidebarEnabled() {
        return Discourse.SiteSettings.layouts_sidebar_right_enabled.split('|').indexOf('tags') > -1
      },

      @computed('application.currentPath')
      mainStyle() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        return Ember.String.htmlSafe(`width: ${getContentWidth(left, right)};`);
      },

      @computed('application.currentPath')
      leftStyle() {
        return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
      },

      @computed('application.currentPath')
      rightStyle() {
        return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
      },

      @computed('application.currentPath', 'loading')
      mainClasses() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        let classes = 'tags';

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
        if (this.get('navigationDisabled')) {
          classes += ' navigation-disabled'
        }
        if (this.get('headerDisabled')) {
          classes += ' header-disabled'
        }
        if (this.get('navMenuEnabled')) {
          classes += ' nav-menu-enabled'
        }
        return classes
      }
    });

    NavigationBar.reopen({
      @computed('navItems')
      navMenuEnabled() {
        return getOwner(this).lookup('controller:discovery').get('navMenuEnabled');
      }
    })

    NavigationItem.reopen({
      buildBuffer(buffer) {
        const content = this.get('content');
        const linkDisabled = this.get('linkDisabled');
        let attrs = linkDisabled ? '' : "href='" + content.get('href') + "'";

        buffer.push(`<a ${attrs}>`);
        if (content.get('hasIcon')) {
          buffer.push("<span class='" + content.get('name') + "'></span>");
        }
        buffer.push(this.get('content.displayName'));
        buffer.push("</a>");
      }
    })
  }
}
