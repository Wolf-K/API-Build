exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //
  
  model.title = model.name || '';
  model.has_operands = hasNonEmptyArray(model.operands)
  model.has_return_value = hasNonEmptyArray(model.return_value)
  model.has_environments = hasNonEmptyArray(model.environments)
  model.has_code_samples = hasNonEmptyArray(model.code_samples)
  model.has_related_topics = hasNonEmptyArray(model.related_topics)
  
  // Process operand parameters
  if (model.has_operands) {
    model.operands.forEach(param => {
      generateSimplePythonAndDialogDescription(param)
    })
  }
  
  // Process return values
  if (model.has_return_value) {
    model.return_value.forEach(param => {
      generateSimplePythonAndDialogDescription(param)
    })
  }
  
  // Process environments
  if (model.has_environments) {
    generateEnvironmentSectionData(model)
  }
  
  // Process related topics
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)
  }

  return model
}
