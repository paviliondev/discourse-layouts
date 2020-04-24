const excludedFilters = ['map', 'calendar'];

let getRoutes = function(path) {
  if (!path) { return false; }
  let pathArr = path.split('.');
  if (pathArr[0] === 'discovery') {
    pathArr.shift();
  }
  return pathArr[0].split(/(?=[A-Z])/).map(function(x){
    return x.toLowerCase();
  });
};

let getFilter = function(path) {
  let routes = getRoutes(path);
  return routes[0] === 'category' || routes[0] === 'parent' ? 'latest' : routes[0];
};

let settingEnabled = function(setting, category, path) {
  if (!path) return false;
  
  let excluded = false;
  excludedFilters.forEach((f) => {
    if (path.indexOf(f) > -1) excluded = true;
  });
  if (excluded) return false;

  if (Discourse.SiteSettings[`${setting}_global`]) return true;
  if (category && category.get(`${setting}_global`)) return true;

  let routes = getRoutes(path);
  if (!routes) { return false; }

  const siteEnabled = Discourse.SiteSettings[setting].split('|');
  const filter = getFilter(path);

  if ((routes.indexOf('category') > -1) && category) {
    const categoryEnabled = category.get(setting);
    return siteEnabled.indexOf('category') > -1 ||
           categoryEnabled && categoryEnabled.split('|').indexOf(filter) > -1;
  }

  if (routes.indexOf('categories') > -1) {
    return siteEnabled.indexOf('categories') > -1;
  }

  if (routes.indexOf('tags') > -1) {
    return siteEnabled.indexOf('tags') > -1;
  }

  if (routes.indexOf('topic') > -1) {
    if (siteEnabled.indexOf('topic') > -1) return true;

    if (!category) return false;
    const categoryEnabled = category.get(setting);

    return categoryEnabled && categoryEnabled.split('|').indexOf('topic') > -1;
  }

  return siteEnabled.indexOf(filter) > -1;
};

export { settingEnabled, excludedFilters };
