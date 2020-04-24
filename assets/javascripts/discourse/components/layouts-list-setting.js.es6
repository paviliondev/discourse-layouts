import ListSetting from 'select-kit/components/list-setting';

export default ListSetting.extend({
  didReceiveAttrs() {
    this._super(...arguments);
    if (this.settingValue) {
      this.set('value', this.settingValue.split('|'));
    }
  },
  
  onChange(value) {
    this.set("settingValue", value.join('|'));
  }
});