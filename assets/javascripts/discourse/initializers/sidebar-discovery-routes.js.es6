import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';
import { renderTemplateTopic, renderTemplateCategory } from '../lib/display';
import { settingEnabled } from '../lib/settings';

export default {
  name: 'sidebar-discovery-routes',
  initialize(container){
    const site = container.lookup('site:main');
    if (site.mobileView) { return }

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

    discoveryTopicRoutes.forEach(function(route){
      var route = container.lookup(`route:discovery.${route}`)
      route.reopen({
        renderTemplate() {
          renderTemplateTopic(this, false, this.get('routeName'))
        }
      })
    })

    discoveryCategoryRoutes.forEach(function(route){
      var route = container.lookup(`route:discovery.${route}`)
      route.reopen({
        renderTemplate(controller, model) {
          renderTemplateCategory(this, model.category, this.get('routeName'))
        }
      })
    })

    DiscoveryCategoriesRoute.reopen({
      renderTemplate(controller, model) {
        if (!settingEnabled('layouts_list_navigation_disabled', false, 'categories')) {
          this.render('navigation/categories', { outlet: 'navigation-bar' });
        }
        this.render("discovery/categories", { outlet: "list-container" });
      }
    })
  }
}
