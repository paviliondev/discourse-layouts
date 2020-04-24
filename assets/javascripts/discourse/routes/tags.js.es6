import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  renderTemplate() {
    this.render('sidebar-wrapper');
  }
});
