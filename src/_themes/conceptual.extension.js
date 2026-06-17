// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
var common = require('./common.js');

/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
  model._appSearch = model._appSearch || model.__global.search;
  model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
  model = common.setBuildType(model);
  model.metaTags = model.toolbox_summary ? [
    { name: "toolboxSummary", content: model.toolbox_summary },
  ] : null;
  return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}
