import { isDevelopment } from "discourse-common/config/environment";

export const LAYOUTS_WIDGETS = [
  {
    layouts_id: "layouts-category-list",
    name: "Category List",
    value: "https://github.com/paviliondev/layouts-category-list-widget.git",
    description: "Display a list of categories.",
    meta_url: "https://discourse.pluginmanager.org/t/category-list-widget/279",
    theme_name: "Layouts Category List Widget"
  },
  {
    layouts_id: "layouts-groups-list",
    name: "Groups",
    value: "https://github.com/paviliondev/layouts-groups-widget.git",
    description: "Allows each user to see what groups they are in.",
    meta_url: "https://discourse.pluginmanager.org/t/groups-widget/288",
    theme_name: "Layouts Groups Widget"
  },
  {
    layouts_id: "layouts-custom-html",
    name: "Custom HTML",
    value: "https://github.com/paviliondev/layouts-custom-html.git",
    description: "Display any custom HTML.",
    meta_url: "https://discourse.pluginmanager.org/t/custom-html-widget/283",
    theme_name: "Layouts Custom Html"
  },
  {
    layouts_id: "layouts-tag-list",
    name: "Tag List",
    value: "https://github.com/paviliondev/layouts-tag-list-widget.git",
    description: "Display your site tags",
    meta_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
    theme_name: "Layouts Tag List Widget"
  },
  {
    layouts_id: "layouts-profile",
    name: "Profile",
    value: "https://github.com/paviliondev/layouts-profile-widget.git",
    description: "Showing the current user's profile",
    meta_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
    theme_name: "Layouts Profile Widget"
  },
  {
    layouts_id: "layouts-topic-lists",
    name: "Topic Lists",
    value: "https://github.com/paviliondev/layouts-topic-lists-widget.git",
    description: "Easily add custom text-based links to the header.",
    meta_url: "https://discourse.pluginmanager.org/t/topic-lists-widget/280",
    theme_name: "Layouts Topic Lists Widget"
  }
];

function themeHasSameUrl(theme, url) {
  const themeUrl = theme.remote_theme && theme.remote_theme.remote_url;
  return (themeUrl && url && url.replace(/\.git$/, "") === themeUrl.replace(/\.git$/, ""));
}

export function findTheme(themes, widget) {
  let result = themes.find((_theme) => (themeHasSameUrl(_theme, widget.value)));
  if (!result && isDevelopment()) {
    result = themes.find((_theme) => (_theme.name === widget.theme_name));
  }
  return result;
}
