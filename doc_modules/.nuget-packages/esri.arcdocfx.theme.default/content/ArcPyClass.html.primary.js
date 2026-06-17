var ArcPyClassCommon = require('./ArcPyClass.common.js');
var extension = require('./ArcPyClass.extension.js');

exports.transform = function (model) {
  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  model.page_title = model.title;

  if (ArcPyClassCommon && ArcPyClassCommon.transform) {
    model = ArcPyClassCommon.transform(model);
  }

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }

  return model;
}