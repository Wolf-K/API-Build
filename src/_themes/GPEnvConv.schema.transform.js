exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //
  model.title = model.label || ''
  model.has_code_samples = hasNonEmptyArray(model.code_samples)
  model.has_related_topics = hasNonEmptyArray(model.related_topics)
  const tokens = model.__tokens || {}


  model.title = model.label
  
  // Process code samples
  if (!model.has_code_samples) {
    delete model.code_samples
  }
  
  // Process related topics
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)}

  return model
}
