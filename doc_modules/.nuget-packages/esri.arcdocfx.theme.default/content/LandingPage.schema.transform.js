exports.transform = function (model) {
  // The mustache templates don't include support for complex logic, so
  // we run this schema transform before rendering the content to HTML
  // so that we can manipulate the model in its raw state. 
  // 
  // Calls to functions that aren't included in this file are pulled 
  // in at build time from SchemaHelperFunctions.js via the arcdocfx CLI.
  //

  model.has_sections = hasNonEmptyArray(model.sections);
  const disableToc = model._disableToc || false;

  // Process sections
  if (model.has_sections) {
    model.sections.forEach(function (section) {
      generateLandingPageSectionData(section, disableToc)
    });
  }
  
  return model;
}