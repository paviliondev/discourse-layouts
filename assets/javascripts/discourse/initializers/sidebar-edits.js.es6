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

      @on('init')
      @observes('application.currentPath')
      discoveryDomEdits() {
        // text hidden by default to avoid 'flicker' on render
        if (!Discourse.SiteSettings.sidebar_list_btn_labels_disabled) {
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
        if (Discourse.SiteSettings.sidebar_list_header_disabled) {
          Ember.run.scheduleOnce('afterRender', function() {
            $('.main-content thead').hide()
          })
        }
      },

      sidebarEnabled(side) {
        const childRoutes = this.childRoutes();
        if (!childRoutes) { return false }

        const siteEnabled = Discourse.SiteSettings[`sidebar_${side}_enabled`].split('|');
        const filter = this.get('filter');

        if (childRoutes.indexOf('category') > -1) {
          const categoryEnabled = this.get(`category.sidebar_${side}_enabled`)
          return siteEnabled.indexOf('category') > -1 ||
                 categoryEnabled && categoryEnabled.split('|').indexOf(filter) > -1
        }
        if (childRoutes.indexOf('categories') > -1) {
          return siteEnabled.indexOf('categories') > -1;
        }
        return siteEnabled.indexOf(filter) > -1;
      },

      childRoutes() {
        const path = this.get('application.currentPath');
        if (!path) { return false }
        let pathArr = path.split('.')
        pathArr.shift()
        return pathArr[0].split(/(?=[A-Z])/).map(function(x){return x.toLowerCase()});
      },

      @computed('application.currentPath')
      filter() {
        let childRoutes = this.childRoutes();
        return childRoutes[0] === 'category' || childRoutes[0] === 'parent' ?
               'latest' : childRoutes[0];
      },

      @computed('application.currentPath')
      leftSidebarEnabled() {
        return this.sidebarEnabled('left')
      },

      @computed('application.currentPath')
      rightSidebarEnabled() {
        return this.sidebarEnabled('right')
      },

      @computed('application.currentPath')
      mainStyle() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        return `width: ${getContentWidth(left, right)};`;
      },

      @computed('application.currentPath', 'loading')
      mainClasses() {
        const left = this.get('leftSidebarEnabled');
        const right = this.get('rightSidebarEnabled');
        let classes = 'discovery'

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
        if (Discourse.SiteSettings.sidebar_list_navigation_disabled) {
          classes += ' navigation-disabled'
        }
        if (Discourse.SiteSettings.sidebar_list_header_disabled) {
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
        return this.site.mobileView || Discourse.SiteSettings.sidebar_list_header_disabled
      }.property()
    });

    EditCategorySettings.reopen({
      leftChoices: Ember.A(),
      rightChoices: Ember.A()
    })
  }
}
