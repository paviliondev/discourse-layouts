import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';

export default {
  name: 'sidebar-discovery-routes',
  initialize(container){
    const site = Discourse.Site.current()
    let discoveryTopicRoutes = []
    let discoveryCategoryRoutes = [
      'Category',
      'ParentCategory',
      'CategoryNone',
    ]
    let filters = site.get('filters')
    filters.push('top')
    filters.forEach(filter => {
      const filterCapitalized = filter.capitalize();
      discoveryTopicRoutes.push(filterCapitalized)
      discoveryCategoryRoutes.push(...[
        `${filterCapitalized}Category`,
        `${filterCapitalized}ParentCategory`,
        `${filterCapitalized}CategoryNone`
      ])
    })

    site.get('periods').forEach(period => {
      const periodCapitalized = period.capitalize();
      discoveryTopicRoutes.push(`Top${periodCapitalized}`)
      discoveryCategoryRoutes.push(...[
        `Top${periodCapitalized}Category`,
        `Top${periodCapitalized}ParentCategory`,
        `Top${periodCapitalized}CategoryNone`
      ])
    })

    const renderTemplateTopic = function(self) {
      if (Discourse.SiteSettings.sidebar_list_navigation_disabled) {
        Ember.run.scheduleOnce('afterRender', function() {
          $('.main-content').addClass('navigation-disabled')
        })
      } else {
        self.render('navigation/default', { outlet: 'navigation-bar' });
      }
      self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
    }

    const renderTemplateCategory = function(self) {
      if (!Discourse.SiteSettings.sidebar_list_navigation_disabled) {
        self.render('navigation/category', { outlet: 'navigation-bar' });
      }
      if (self._categoryList) {
        self.render('discovery/categories', { outlet: 'header-list-container', model: self._categoryList });
      }
      self.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
    }

    discoveryTopicRoutes.forEach(function(route){
      var route = container.lookup(`route:discovery.${route}`)
      route.reopen({
        renderTemplate() { renderTemplateTopic(this) }
      })
    })

    discoveryCategoryRoutes.forEach(function(route){
      var route = container.lookup(`route:discovery.${route}`)
      route.reopen({
        renderTemplate() { renderTemplateCategory(this) }
      })
    })

    DiscoveryCategoriesRoute.reopen({
      renderTemplate() {
        if (!Discourse.SiteSettings.sidebar_list_navigation_disabled) {
          this.render('navigation/category', { outlet: 'navigation-bar' });
        }
        this.render("discovery/categories", { outlet: "list-container" });
      },
    })
  }
}
