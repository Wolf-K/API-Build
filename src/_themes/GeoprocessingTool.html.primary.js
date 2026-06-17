var GPToolCommon = require('./GeoprocessingTool.common.js');
var extension = require('./GeoprocessingTool.extension.js');

exports.transform = function (model) {
  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  model.page_title = model.label && model.toolbox_name ? `${model.label} (${model.toolbox_name})` : model.title;

  if (GPToolCommon && GPToolCommon.transform) {
    model = GPToolCommon.transform(model);
  }

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }

  return model;
}