const enableChoices = ['latest', 'new', 'unread', 'top', 'topic'];
const settings = ['sidebar_left_enabled','sidebar_right_enabled','sidebar_left_widgets','sidebar_right_widgets','list_navigation_disabled','list_header_disabled','list_nav_menu'];

export default {
  setupComponent(args, component) {
    const category = args.category;

    if (!category.custom_fields) {
      category.custom_fields = {};
    }

    const choices = (this.site.layout_widgets || []).map((w) => w.name);

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
