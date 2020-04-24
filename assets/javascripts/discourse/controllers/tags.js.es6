import Sidebars from '../mixins/sidebars';
import { inject } from "@ember/controller";
import { alias } from "@ember/object/computed";
import Controller from "@ember/controller";

export default Controller.extend(Sidebars, {
  application: inject('application'),
  tagsShow: inject('tagsShow'),
  category: alias('tagsShow.category'),
  mainContent: 'tags'
});
