import { ajax } from 'discourse/lib/ajax';

export default {
  setupComponent(args, component) {
    const choices = this.site.get('widgets').map((w) => w.name);
    component.setProperties({
      choices,
      enableChoices: ['latest', 'new', 'unread', 'top', 'topic']
    });
  }
}
