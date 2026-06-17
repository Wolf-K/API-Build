  var common = require('./common.js');
  
  exports.preTransform = function (model) {
    model.htmlId = common.getHtmlId(model.uid);
    model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
    model._disableToc = false;
    model._disableAffix = false;
    model._disableBreadcrumb = false;
    model.metaTags = [
      { name: "moduleName", content: model.module_name },
      { name: "operatorName", content: model.name },
    ];

    // Set build type
    model = common.setBuildType(model);

    return model;
  }
  
  exports.postTransform = function (model) {
    return model;
  };
