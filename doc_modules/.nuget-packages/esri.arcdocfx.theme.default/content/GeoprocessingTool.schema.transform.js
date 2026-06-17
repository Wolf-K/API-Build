exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //
  const tokens = model.__tokens || {};
  const toolName = model.name || ''
  const toolboxAlias = model.toolbox_alias || ''
  const toolLabel = model.label || ''
  model.title = toolLabel;
  model.is_model_builder_tool = isModelBuilderTool(model);

  model.has_params = hasNonEmptyArray(model.params);
  model.has_derived_output = hasNonEmptyArray(model.derived_output);
  model.has_return_value = hasNonEmptyArray(model.return_value);
  model.has_code_samples = hasNonEmptyArray(model.code_samples);
  model.has_environments = hasNonEmptyArray(model.environments);
  model.has_related_topics = hasNonEmptyArray(model.related_topics);

  // Process parameters
  if (model.has_params) {
    // Generate tool syntax
    model.python_syntax = generateToolSyntax(toolName, toolboxAlias, model.params || [])
    // Generate python and dialog parameter data
    model.params.forEach(param => {
      generatePythonAndDialogParameterData(param, tokens)
    })
  }
  
  // Process derived outputs
  if (model.has_derived_output) {
    model.derived_output.forEach(param => {
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
  
  // Process licensing
  // We don't check for licensing data existence here
  // because GP tools are required to have licensing information
  generateLicensingData(model)
  
  // Process related topics
  if (model.has_related_topics) {
    generateRelatedTopicsMD(model)
  }

  // Clean up keywords spacing
  model.keywords = model.keywords.replace(' , ', ',').replace(', ', ',').replace(' ,', ',');

  return model
}
