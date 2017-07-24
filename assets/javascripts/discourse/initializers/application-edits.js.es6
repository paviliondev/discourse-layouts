import ApplicationController from 'discourse/controllers/application';
import Category from 'discourse/models/category';
import { default as computed } from 'ember-addons/ember-computed-decorators';

export default {
  name: 'application-edits',
  initialize() {
    ApplicationController.reopen({
      navigationCategory: Ember.inject.controller("navigation/category"),

      @computed('navigationCategory.category', 'currentUser.community_id')
      pavilion(navCat, communityId){
        return navCat || Category.findById(communityId);
      }
    })
  }
}
