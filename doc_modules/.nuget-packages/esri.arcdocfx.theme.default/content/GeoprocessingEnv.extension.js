  var common = require('./common.js');
  exports.preTransform = function (model) {
    model.htmlId = common.getHtmlId(model.uid);
    model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
    model._disableToc = false;
    model._disableAffix = false;
    model._disableBreadcrumb = false;
    model = common.setBuildType(model);
    model.metaTags = [
      { name: "envName", content: model.name },
      { name: "envLabel", content: model.label },
      { name: "envCategory", content: model.category },
    ];

    return model;
  }
  
  exports.postTransform = function (model) {
    return model;
  };
