import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Mixin.create({
  path: Ember.computed.alias('application.currentPath'),

  @computed('path')
  leftStyle() {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return '';
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_left_width}px;`);
  },

  @computed('path')
  rightStyle() {
    const isMobile = this.get('site.mobileView');
    if (isMobile) return '';
    return Ember.String.htmlSafe(`width: ${this.siteSettings.layouts_sidebar_right_width}px;`);
  },

  actions: {
    toggleSidebar(side) {
      const $sidebar = $(`aside.sidebar.${side}`);
      const opposite = side === 'right' ? 'left' : 'right';
      const $oppositeToggle = $(`.mobile-toggle.${opposite}`);
      let value = 0;
      if ($sidebar.hasClass('open')) {
        value = '-90vw';
      } else {
        $oppositeToggle.hide();
      }
      let params = {}; params[side] = value;

      $sidebar.animate(params, 200, () => {
        $sidebar.toggleClass('open');
        if (!$sidebar.hasClass('open')) {
          $oppositeToggle.show();
        }
      });
    }
  }
});
