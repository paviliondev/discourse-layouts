import { ajax } from 'discourse/lib/ajax';

const enableChoices = ['latest', 'new', 'unread', 'top'];

export default {
  setupComponent(args, component) {
    ajax("/admin/site_settings").then(function (settings) {
      let rightWidgetChoices = settings.site_settings.find((setting) => {
        return setting.setting === 'layouts_sidebar_right_widgets';
      }).choices
      let leftWidgetChoices = settings.site_settings.find((setting) => {
        return setting.setting === 'layouts_sidebar_left_widgets';
      }).choices
      component.setProperties({
        leftWidgetChoices: leftWidgetChoices,
        rightWidgetChoices: rightWidgetChoices,
        enableChoices: enableChoices,
        hasChoices: true
      })
    });
  }
}
