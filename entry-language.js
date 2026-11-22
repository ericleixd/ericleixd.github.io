// 只由无语言路径的首页加载。语言专页同时用于分享与手动选择，不能再次跳转。
(function () {
  var preferred = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  var parts = preferred.toLowerCase().replace(/_/g, '-').split('-');
  var locale = 'en';
  if (parts[0] === 'zh') {
    // BCP 47 的文字子标签比地区更具体，例如 zh-Hans-HK 仍然是简体。
    var traditional = parts[1] === 'hant' ||
      (parts[1] !== 'hans' && /^(hk|mo|tw)$/.test(parts[1]));
    locale = traditional ? 'zh-Hant' : 'zh-Hans';
  }
  location.replace('/' + locale + '/' + location.search + location.hash);
}());
