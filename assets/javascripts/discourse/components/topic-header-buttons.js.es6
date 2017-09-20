import TopicFooterButtons from 'discourse/components/topic-footer-buttons';
import { getOwner } from 'discourse-common/lib/get-owner';

export default TopicFooterButtons.extend({
  elementId: 'topic-header-buttons',
  layoutName: 'components/topic-header-buttons',

  actions: {
    toggleBookmark() {
      const controller = getOwner(this).lookup('controller:topic');
      controller.send('toggleBookmark');
    },

    showInvite(){
      const route = getOwner(this).lookup('route:topic');
      route.send("showInvite");
    },

    replyToPost() {
      const controller = getOwner(this).lookup('controller:topic');
      controller.send('replyToPost');
    }
  }
});
