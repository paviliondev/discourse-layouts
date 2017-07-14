import Category from 'discourse/models/category';
import { getOwner } from 'discourse-common/lib/get-owner';
import { on, default as computed } from 'ember-addons/ember-computed-decorators';
import DiscourseURL from 'discourse/lib/url';

export default Ember.Component.extend({
  classNames: ['topic-header-navigation'],

  @on('init')
  setup() {
    const store = getOwner(this).lookup('store:main');
    const application = getOwner(this).lookup('controller:application');
    const topic = this.get('topic');
    const category = application.get('pavilion');
    const filter = 'c/' + Category.slugFor(category);

    store.findFiltered('topicList', {filter}).then((list) => {
      const topics = list.topics;

      let currentIndex = null;
      topics.forEach((t, i) => { if (t.id === topic.id ) currentIndex = i; });

      let previousIndex = currentIndex + 1;
      let nextIndex = currentIndex - 1;

      let previousTopic = topics.filter((t, i) => i === previousIndex)[0];
      let nextTopic = topics.filter((t, i) => i === nextIndex)[0];

      this.setProperties({ previousTopic, nextTopic });
    })
  },

  @computed('nextTopic')
  nextTopicTitle(nextTopic) {
    return nextTopic ? nextTopic.title : I18n.t('topic.no_next');
  },

  @computed('previousTopic')
  previousTopicTitle(previousTopic) {
    return previousTopic ? previousTopic.title : I18n.t('topic.no_previous');
  },

  actions: {
    goTo(direction) {
      DiscourseURL.routeTo('/t/' + this.get(`${direction}Topic.slug`));
    }
  }
})
