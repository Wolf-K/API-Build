var GPToolCommon = require('./ArcPyFunction.common.js');
var extension = require('./ArcPyFunction.extension.js');

exports.transform = function (model) {
  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  model.page_title = model.title;

  if (GPToolCommon && GPToolCommon.transform) {
    model = GPToolCommon.transform(model);
  }

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }

  return model;
}