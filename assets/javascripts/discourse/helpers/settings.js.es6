
var getRoutes = function(path) {
  if (!path) { return false }
  let pathArr = path.split('.')
  if (pathArr[0] === 'discovery') {
    pathArr.shift()
  }
  return pathArr[0].split(/(?=[A-Z])/).map(function(x){
    return x.toLowerCase()
  });
}

var getFilter = function(path) {
  let routes = getRoutes(path);
  return routes[0] === 'category' || routes[0] === 'parent' ?
         'latest' : routes[0];
}

var settingEnabled = function(setting, category, path) {
  let routes = getRoutes(path);
  if (!routes) { return false }

  const siteEnabled = Discourse.SiteSettings[setting].split('|');
  const filter = getFilter(path);

  if (routes.indexOf('category') > -1) {
    const categoryEnabled = category.get(setting)
    return siteEnabled.indexOf('category') > -1 ||
           categoryEnabled && categoryEnabled.split('|').indexOf(filter) > -1
  }
  if (routes.indexOf('categories') > -1) {
    return siteEnabled.indexOf('categories') > -1;
  }
  return siteEnabled.indexOf(filter) > -1;
}

export { settingEnabled }
