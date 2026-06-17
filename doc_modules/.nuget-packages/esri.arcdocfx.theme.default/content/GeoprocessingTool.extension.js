  var common = require('./common.js');
  
  exports.preTransform = function (model) {
    model.htmlId = common.getHtmlId(model.uid);
    model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
    model._disableToc = false;
    model._disableAffix = false;
    model._disableBreadcrumb = false;
    model._gpTool = true;
    model = common.setBuildType(model);
    model.metaTags = [
      { name: "toolboxName", content: model.toolbox_name },
      { name: "toolsetName", content: model.toolset_name },
      { name: "toolNameEN", content: model.name },
      { name: "toolLabel", content: model.label },
      { name: "environments", content: model.environments_meta },
      { name: "keywords", content: model.keywords }
    ];


    return model;
  }
  
  exports.postTransform = function (model) {
    return model;
  };
