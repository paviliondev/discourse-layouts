import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';
import Category from 'discourse/models/category';
import { renderTemplateCategory } from '../lib/display';
import { settingEnabled } from '../lib/settings';

export default {
  name: 'grandchild-category-routes',
  initialize(container){
    const site = container.lookup('site:main');
    if (site.mobileView) { return };

    let grandchildCategoryRoutes = [
      'grandchildCategory'
    ];

    let filters = site.get('filters');
    filters.push('top');
    filters.forEach(filter => {
      const filterCapitalized = filter.capitalize();
      grandchildCategoryRoutes.push(...[
        `${filterCapitalized}GrandchildCategory`,
      ])
    });

    site.get('periods').forEach(period => {
      const periodCapitalized = period.capitalize();
      grandchildCategoryRoutes.push(...[
        `Top${periodCapitalized}GrandchildCategory`,
      ])
    });

    grandchildCategoryRoutes.forEach(function(route){
      var route = container.lookup(`route:discovery.${route}`);
      if (route) {
        route.reopen({
          renderTemplate(controller, model) {
            renderTemplateCategory(this, model.category, this.get('routeName'));
          }
        })
      }
    });
  }
}
