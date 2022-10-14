import { createWidget } from "discourse/widgets/widget";

export default createWidget("login-required", {
  tagName: "div.widget-login-required",

  html() {
    return this.attach("button", {
      label: "log_in",
      className: "btn-primary btn-small login-button",
      action: "showLogin",
      icon: "user",
    });
  },
});
