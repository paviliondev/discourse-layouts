import Sidebars from '../mixins/sidebars';
import { withPluginApi } from 'discourse/lib/plugin-api';
import DiscourseRoute from "discourse/routes/discourse";
import Controller from "@ember/controller";

export default {
  name: 'sidebar-tags',
  initialize(container, app){
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (!siteSettings.layouts_enabled ||
        (site.mobileView && !siteSettings.layouts_mobile_enabled)) return;
    
    // Ensure tags routes and controllers exist
    if (!app.TagsRoute) {
      app.TagsRoute = DiscourseRoute.extend();
    }
    if (!app.TagsController) {
      app.TagsController = Controller.extend();
    }
    if (!app.TagRoute) {
      app.TagRoute = DiscourseRoute.extend();
    }
    if (!app.TagController) {
      app.TagController = Controller.extend();
    }
    
    withPluginApi('0.8.32', api => {
      api.modifyClass('route:tags', {
        renderTemplate() {
          this.render('sidebar-wrapper');
        }
      });
      
      api.modifyClass('controller:tags', Sidebars);
      
      api.modifyClass('controller:tags', {
        mainContent: 'tags'
      });
      
      api.modifyClass('route:tag', {
        renderTemplate() {
          this.render('sidebar-wrapper');
        }
      });
      
      api.modifyClass('controller:tag', Sidebars);
      
      api.modifyClass('controller:tag', {
        mainContent: 'tag'
      });
    });
  }
}
