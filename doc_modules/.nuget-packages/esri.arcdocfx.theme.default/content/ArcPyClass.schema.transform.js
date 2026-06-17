exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //
  model.title = model.name;
  model.has_params = hasNonEmptyArray(model.params);
  model.has_properties = hasNonEmptyArray(model.properties);
  model.has_methods = hasNonEmptyArray(model.methods);
  model.has_return_value = hasNonEmptyArray(model.return_value);
  model.has_code_samples = hasNonEmptyArray(model.code_samples);
  model.has_related_topics = hasNonEmptyArray(model.related_topics);
  
  // Process parameters
  if (model.has_params) {
    // Generate class syntax if callable
    if (model.callable) {
      // The method parameter indicates whether to format as a method or not
      model.class_syntax = generateArcPySyntax(model.name, model.params, false)
    }
  } else {
    if (model.callable) {
      // The method parameter indicates whether to format as a method or not
      model.class_syntax = generateArcPySyntax(model.name, model.params, false)
    }
  }

  // Process methods
  if (model.has_methods) {
    model.methods.forEach((method) => {
      // The method parameter indicates whether to format as a method or not
      method.method_syntax = generateArcPySyntax(method.name, method.params, true)
      method.has_params = hasNonEmptyArray(method.params);
      method.has_return_value = hasNonEmptyArray(method.return_value);
      method.has_code_samples = hasNonEmptyArray(method.code_samples);
    })
  }

  // Process related topics
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)
  }

  return model
}
