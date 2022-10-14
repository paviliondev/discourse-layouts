import Component from "@ember/component";
import { equal } from "@ember/object/computed";
import discourseComputed from "discourse-common/utils/decorators";
import EmberObject, { get } from "@ember/object";

export default Component.extend({
  isText: equal('setting.type', 'text'),
  isTextarea: equal('setting.type', 'textarea'),
  classNames: ['control-group'],

  didReceiveAttrs() {
    let currentValue;

    if (!this.widget.settings) {
      this.widget.set("settings", EmberObject.create());
    } else {
      currentValue = get(this.widget.settings, this.setting.name);
    }

    this.set('currentValue', currentValue);
  },

  @discourseComputed('setting.name')
  label(name) {
    return name.replace (/^[-_]*(.)/, (_, c) => c.toUpperCase())
      .replace (/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
  },

  @discourseComputed('setting.name', 'widget.settings')
  value(settingName, widgetSettings) {
    if (!widgetSettings) { return null };
    return widgetSettings[settingName];
  },

  actions: {
    changeInputValue(value) {
      this.widget.settings.set(this.setting.name, value);

      if (!this.dirty) {
        this.setDirty();
      }
    }
  }
});
