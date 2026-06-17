// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
var extension = require('./LandingPage.extension.js')

exports.transform = function (model) {
  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  model.page_title = model.title;

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }

  return model;
}
