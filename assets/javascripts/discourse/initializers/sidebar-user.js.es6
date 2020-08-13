import Sidebars from '../mixins/sidebars';
import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'sidebar-user',
  initialize(container){
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (!siteSettings.layouts_enabled ||
        (site.mobileView && !siteSettings.layouts_mobile_enabled)) return;
    
    withPluginApi('0.8.32', api => {
      api.modifyClass('route:user', {
        renderTemplate() {
          this.render('sidebar-wrapper');
          this.render('user', {
            into: 'sidebar-wrapper',
            outlet: 'main-content',
            controller: 'user',
            model: this.modelFor('user')
          })
        }
      });
      
      api.modifyClass('controller:user', Sidebars);
      
      api.modifyClass('controller:user', {
        mainContent: 'user',
      });
    });
  }
}
