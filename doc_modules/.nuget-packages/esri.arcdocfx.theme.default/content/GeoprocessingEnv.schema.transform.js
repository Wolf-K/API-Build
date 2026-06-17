exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //

  model.title = model.label || ''
  const tokens = model.__tokens || {}
  const environmentName = model.name || ''
  const environmentLabel = model.title
  model.has_params = hasNonEmptyArray(model.params);
  model.has_code_samples = hasNonEmptyArray(model.code_samples);
  model.has_related_topics = hasNonEmptyArray(model.related_topics);
  
  
  // Process parameter descriptions
  if (model.has_params) {
    model.python_syntax = generateEnvironmentPythonSyntaxMD(environmentName, model.params)
    model.params.forEach((param) => {
      generateSimplePythonAndDialogDescription (param, tokens)
    })
  } else {
    model.dialog_syntax_md = model.dialog_syntax
    model.python_syntax = generateEnvironmentPythonSyntaxMD(environmentName)
  }

  // If the model has no code samples, delete the property
  if (!model.has_code_samples) {
    delete model.code_samples
  }

  // Process related topics
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)
  }

  return model
}
