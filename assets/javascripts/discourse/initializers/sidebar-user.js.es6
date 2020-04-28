import UserController from 'discourse/controllers/user';
import UserRoute from 'discourse/routes/user';
import Sidebars from '../mixins/sidebars';
import { settingEnabled } from '../lib/layouts-settings';
import { getOwner } from 'discourse-common/lib/get-owner';

export default {
  name: 'sidebar-user',
  initialize(container){
    const site = container.lookup('site:main');
    const siteSettings = container.lookup('site-settings:main');

    if (site.mobileView && !siteSettings.layouts_mobile_enabled ||
        !siteSettings.layouts_enabled ||
        !siteSettings.layouts_profile_enabled) return;

    UserRoute.reopen({
      renderTemplate() {
        this.render('sidebar-wrapper');
      }
    });

    UserController.reopen(Sidebars, {
      mainContent: 'user',
    });
  }
}
