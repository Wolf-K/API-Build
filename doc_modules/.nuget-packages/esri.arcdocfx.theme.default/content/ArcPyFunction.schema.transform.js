exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //
  
  model.title = model.name || '';
  const functionName = model.title
  model.has_params = hasNonEmptyArray(model.params);
  model.has_return_value = hasNonEmptyArray(model.return_value);
  model.has_code_samples = hasNonEmptyArray(model.code_samples);
  model.has_related_topics = hasNonEmptyArray(model.related_topics);
  
  // Generate ArcPy function syntax
  if (model.has_params) {
    // The method parameter indicates whether to format as a method or not
    model.syntax = generateArcPySyntax(functionName, model.params, false)
  } else {
    // The method parameter indicates whether to format as a method or not
    model.syntax = generateArcPySyntax(functionName, null, false)
  }
  
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)
  }

  return model
}
