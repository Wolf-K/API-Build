// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
var common = require('./common.js');
/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
  model._dir = model._lang === 'ar' || model._lang === 'he' ? 'rtl' : 'ltr';
  // If model.enable_toc is undefined, set model._disableToc to false, 
  // otherwise set it to the opposite of model.enable_toc
  model._disableToc = model.enable_toc === undefined ? true : !model.enable_toc;
  // Don't include In this topic section
  model._disableAffix = true;
  // Don't include Breadcrumbs
  model._disableBreadcrumb = true;
  // Don't include the product banner if model._disableToc is true
  model._enableProductBanner = model._disableToc ? true : false;
  model._contentCssClassAppend = "landing"
  model = common.setBuildType(model);

  return model;
}

/**
 * This method will be called at the end of exports.transform in conceptual.html.primary.js
 */
exports.postTransform = function (model) {
  return model;
}