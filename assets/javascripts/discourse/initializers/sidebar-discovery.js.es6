import DiscoveryController from 'discourse/controllers/discovery';
import DiscoveryRoute from 'discourse/routes/discovery';
import Sidebars from '../mixins/sidebars';
import { default as discourseComputed } from 'discourse-common/utils/decorators';
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { readOnly } from "@ember/object/computed";

export default {
  name: 'sidebar-discovery',
  initialize(container){
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (!siteSettings.layouts_enabled ||
        (site.mobileView && !siteSettings.layouts_mobile_enabled)) return;

    DiscoveryRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    DiscoveryController.reopen(Sidebars, {
      mainContent: "discovery",
      router: service(),
      currentPath: readOnly("router.currentRouteName"),
      navigationDefault: controller("navigation/default"),
      navigationCategory: controller("navigation/category"),

      @discourseComputed(
        'navigationDefault.filterType', 
        'navigationCategory.filterType', 
        'currentPath'
      ) filter(defaultFilter, categoryFilter, currentPath) {
        let path = currentPath.toLowerCase();
        if (path.indexOf('categories') > -1) return 'categories';
        if (path.indexOf('category') > -1) return categoryFilter;
        return defaultFilter;
      }
    });
  }
};
