  var common = require('./common.js');
  
  exports.preTransform = function (model) {
    // The reason that we set these here instead of in the schema transform
    // is to maintain consistency with the conceptual templates. Also, these
    // properites don't need to be set prior to the model being transformed
    // to HTML.
    //
    model.htmlId = common.getHtmlId(model.uid);
    model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
    model._disableToc = false;
    model._disableAffix = false;
    model._disableBreadcrumb = false;

    // Set build type
    model = common.setBuildType(model);
    
    return model;
  }
  
  exports.postTransform = function (model) {
    return model;
  };
