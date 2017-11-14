const enableChoices = ['latest', 'new', 'unread', 'top', 'topic'];
const settings = ['sidebar_left_enabled','sidebar_right_enabled','sidebar_left_widgets','sidebar_right_widgets','list_navigation_disabled','list_header_disabled','list_nav_menu'];

export default {
  setupComponent(args, component) {
    const choices = this.site.get('widgets').map((w) => w.name);

    settings.forEach((s) => {
      if (typeof args.category.custom_fields[`layouts_${s}`] !== 'string') {
        args.category.custom_fields[`layouts_${s}`] = '';
      }
    });

    component.setProperties({
      choices,
      enableChoices
    });
  }
};
