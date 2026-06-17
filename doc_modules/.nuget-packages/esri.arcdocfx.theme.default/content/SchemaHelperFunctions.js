exports.addSpan = addSpan
exports.escapeSpecialCharactersForMD = escapeSpecialCharactersForMD
exports.getToken = getToken
exports.generateArcPySyntax = generateArcPySyntax
exports.generateEnvironmentPythonSyntaxMD = generateEnvironmentPythonSyntaxMD
exports.generateEnvironmentSectionData = generateEnvironmentSectionData
exports.generateLandingPageSectionData = generateLandingPageSectionData
exports.generateLicensingData = generateLicensingData
exports.generatePythonAndDialogParameterData =
  generatePythonAndDialogParameterData
exports.generateRelatedTopicsMD = generateRelatedTopicsMD
exports.generateSimplePythonAndDialogDescription =
  generateSimplePythonAndDialogDescription
exports.generateToolSyntax = generateToolSyntax
exports.hasNonEmptyArray = hasNonEmptyArray
exports.hasEnvironmentSpecialCases = hasEnvironmentSpecialCases
exports.isModelBuilderTool = isModelBuilderTool

function addSpan (text, dataKey, dataValue, dataKey2=null, dataValue2=null) {
  // switching to span tags due to MD span indicators causing issues with multi-line descriptions
  const dataValueStr = String(dataValue)
  if (!dataKey2 && !dataValue2) {
    return `<span data-${dataKey}="${escapeCharactersForHTML(dataValueStr)}">${text.trim()}</span>`
  } else {
    return `<span data-${dataKey}="${escapeCharactersForHTML(dataValueStr)}" data-${dataKey2}="${escapeCharactersForHTML(dataValue2)}">${text.trim()}</span>`
  }
}

function addIndent (text, numSpaces) {
  const indent = ' '.repeat(numSpaces)
  const lines = []
  text.split('\n').forEach((line, index) => {
    // If it's the first line, we don't want to add an indent
    if (line !== '' || index > 0) {
      line = indent + line
    }
    lines.push(line)
  })
  return lines.join('\n')
}

function escapeSpecialCharactersForMD (text) {
  // if text is undefined or null, return empty string'
  if (text === undefined || text === null) {
    return ''
  }
  // Preserve <sup> and <sub> tags, escape all other < and >
  text = text.replace(/<(\/?)((sup|sub))>/g, '!!!TAG!!!$1$2!!!')
  text = text.replace(/</g, '<').replace(/>/g, '>')
  text = text.replace(/!!!TAG!!!([\/]?)(sup|sub)!!!/g, '<$1$2>')
  return text
}

function escapeCharactersForHTML(text) {
  if (text === undefined || text === null) {
    return ''
  }
  // Always replace these first, because we don't want to double escape
  // the `&` in escaped HTML entities.
  text = text.replace(/&/g, '&amp;')
  text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  text = text.replace(/"/g, '&quot;')
  return text
}

function generateArcPySyntax (syntaxName, syntaxParams, method = false) {
  const codeFormatter = method ? '' : '`'
  const hasParams =
    Array.isArray(syntaxParams) && syntaxParams.length > 0 ? true : false
  const syntaxPrefix = hasParams ? `${syntaxName}(` : `${syntaxName}()`
  let generatedSyntax = ''
  if (hasParams) {
    syntaxParams.forEach((param, index) => {
      if (typeof param === 'object') {
        const paramName = param.name?.trim() || ''
        const paramRequired = param.required ? param.required : false
        const paramNameSyntax = paramRequired ? paramName : `{${paramName}}`
        generatedSyntax +=
          paramNameSyntax + (index === syntaxParams.length - 1 ? ')' : ', ')
      }
    })
  }
  // In the case of methods, we don't want to surround the syntax with backticks
  return `${codeFormatter}${syntaxPrefix}${generatedSyntax}${codeFormatter}`
}

function generateEnvironmentSectionData (model) {
  // Generates the environments_md and environments_meta properties
  // and env_special_cases_md for the model
  const environmentsMd = []
  const environmentsMeta = []
  const hasSpecialCases = hasEnvironmentSpecialCases(model.environments)
  let envSpecialCasesMd = hasSpecialCases ? '\n<dl>\n' : ''

  model.environments.forEach(env => {
    if (typeof env === 'object') {
      // Get the environment label, link, and name
      const environmentLabel = env.label
      const environmentLink = env.link
      const environmentName = env.name

      // Add to environments_md if label and link are defined
      if (environmentLabel && environmentLink) {
        environmentsMd.push(`[${environmentLabel}](${environmentLink})`)
      }
      // Add to environments_meta if name is defined
      if (environmentName) {
        environmentsMeta.push(environmentName)
      }
      // Add special cases entry
      if (env.special_case && env.special_case.trim() !== '') {
        const envSpecialCase = env.special_case
        envSpecialCasesMd += `  <dt data-env="${environmentName}">\n    <a href="${environmentLink}">${environmentLabel}</a>\n  </dt>\n  <dd data-env="${environmentName}">\n\n${envSpecialCase}\n\n  </dd>\n`
      }
    }
  })
  envSpecialCasesMd += hasSpecialCases ? '</dl>\n\n' : ''

  // Assign the generated MD property to the model by
  // joining the array with a comma separator for
  // improved readability
  model.environments_md = environmentsMd.join(', ')

  // Assign the generated meta property to the model
  // by joining the array with a comma separator.
  // Don't include space after separator in metadata
  // If you modify this in any way, you must reach out to the GP team to
  //  ensure that their parsing logic still works as expected.
  model.environments_meta = environmentsMeta.join(',')

  // Assign the generated special cases MD to the model
  if (hasSpecialCases) {
    model.env_special_cases_md = envSpecialCasesMd
  }
}

function generateEnvironmentPythonSyntaxMD (
  environmentName,
  syntaxParams = null
) {
  const codeFormatter = '`'
  const hasParams = syntaxParams ? true : false
  const hasMultipleParams =
    Array.isArray(syntaxParams) && syntaxParams.length > 1
  const syntaxPrefix = `arcpy.env.${environmentName}`
  let pythonSyntax = ''
  if (hasParams) {
    syntaxParams.forEach((param, index) => {
      if (typeof param === 'object') {
        const paramName = param.name.trim() || ''
        // If this isn't the last parameter, add a space after it
        pythonSyntax +=
          paramName + (index === syntaxParams.length - 1 ? '' : ' ')
      }
    })
  }
  let pythonSyntaxMD = hasParams
    ? `${codeFormatter}${syntaxPrefix} = ${
        hasMultipleParams ? '"' : ''
      }${pythonSyntax}${hasMultipleParams ? '"' : ''}${codeFormatter}`
    : `${codeFormatter}${syntaxPrefix}${codeFormatter}`

  return pythonSyntaxMD
}

function generateLandingPageSectionData (section, disable_toc) {
  // Generates the landing page section data
  const sectionType = section.type ? section.type : 'text_columns'
  section.isCards = sectionType === 'cards' ? true : false
  section.isTextColumns = sectionType === 'text_columns' ? true : false
  section.isTiles = sectionType === 'tiles' ? true : false

  // Calculate the maximum number of columns
  section.columns_max = !disable_toc
    ? !section.columns_max 
      ? 4 : (section.columns_max = section.columns_max > 5 
        ? 5 : (section.columns_max = section.columns_max === 1 ? 2 : section.columns_max))
    : !section.columns_max 
      ? 3 : (section.columns_max = section.columns_max > 3 
        ? 3 : (section.columns_max = section.columns_max === 1 ? 2 : section.columns_max))
  
  // Calculate the number of columns for medium screens
  section.columns_md =
    Math.ceil(section.columns_max / 2) <= 1
      ? 2
      : Math.ceil(section.columns_max / 2)

  if (hasNonEmptyArray(section.items)) {
    section.items.forEach(function (item) {
      if (item.links) {
        item.hasLinks = true
      }
      if (item.icon_src) {
        if (item.icon_src.endsWith('.svg')) {
          item.isSvgIcon = true
        }
      }
    })
  }
}

function generateLicensingData (model) {
  // Generates the licensing_md property for the model
  let licensingText = ''
  model.licensing.forEach(license => {
    if (license.basic) {
      licensingText += `- ${getToken(model.__tokens, 'gpBasic')}: ${
        license.basic
      }  \n`
      if (license.note) {
        licensingText += `  ${license.note}\n`
      }
    }

    if (license.standard) {
      licensingText += `- ${getToken(model.__tokens, 'gpStandard')}: ${
        license.standard
      }  \n`
      if (license.note) {
        licensingText += `  ${license.note}\n`
      }
    }

    if (license.advanced) {
      licensingText += `- ${getToken(model.__tokens, 'gpAdvanced')}: ${
        license.advanced
      }  \n`
      if (license.note) {
        licensingText += `  ${license.note}\n`
      }
    }
  })
  if (licensingText) {
    model.licensing_md = licensingText
  }
}

function generatePythonAndDialogParameterData (param, tokens) {
  // Generates the Python and Dialog data for a parameter
  if (typeof param === 'object') {
    // 1. Get the parameter name
    const paramName = param.name?.trim() || ''
    // 2. Get the parameter description object
    const desc = param.desc || {}
    // 3. Assign the value of desc_all to desc_dialog and desc_python if they
    //    are not defined. We do this so that there is always a value in both.
    //    That way when we process the descriptions later, we can just work with
    //    the values directly without checking for undefined. Since this is all
    //    done during the transform phase, it does not affect the original YML
    desc.desc_dialog = desc.desc_dialog || desc.desc_all || ''
    desc.desc_python = desc.desc_python || desc.desc_all || ''

    // 4. Process the parameter based on its data type

    // Process Boolean parameters
    if (Array.isArray(param.enums) && param.datatype === 'Boolean') {
      // Add the information that is parsed by the GP team to create the
      // strings for the ArcGIS Pro UI. If you modify this in any way,
      // you must reach out to the GP team to ensure that their parsing
      // logic still works as expected.
      // Yes, this is correct. The python name is not translated, so we
      // use it for the lookup for both the dialog and python descriptions.
      desc.desc_dialog += `\n\n<div data-domains="${paramName}">\n\n`
      desc.desc_python += `\n\n<div data-domains="${paramName}">\n\n`

      // Sort the enums by enum_value with true first, false second, and
      // put undefined or unknown values last
      const sortedEnums = param.enums.slice().sort((a, b) => {
        const aValue = a.enum_value
        const bValue = b.enum_value

        // true first
        if (aValue === true && bValue !== true) return -1
        if (aValue !== true && bValue === true) return 1

        // false second
        if (aValue === false && bValue !== false) return -1
        if (aValue !== false && bValue === false) return 1

        // undefined last
        if (aValue === undefined && bValue !== undefined) return 1
        if (aValue !== undefined && bValue === undefined) return -1

        // Otherwise, keep original order
        return 0
      })

      // Process the sorted enum items
      sortedEnums.forEach(enumItem => {
        if (typeof enumItem === 'object') {
          // Determine the checked state based on the enum_value
          // We get the text for the checked and unchecked states
          // from token.json and if the enum_value is not true or
          // false, or is undefined, we use placeholder text to
          // alert the author that there is a missing boolean value
          let checkedState =
            enumItem.enum_value === true
              ? getToken(tokens, 'gpBooleanChecked')
              : enumItem.enum_value === false
              ? getToken(tokens, 'gpBooleanUnchecked')
              : 'DOCTOPIA_MISSING_BOOLEAN_VALUE'
          // Get the name of the enum and remove any extra spaces
          // We don't need to get the label for boolean enums since their
          // label values (Checked and Unchecked) are pulled directly from
          // token.json.
          const enumName = enumItem.enum_name.trim()
          // Get the description object for the enum
          const enumDescValue = enumItem.enum_desc || {}
          // If there is an enum_desc_all, assign it to both
          // the enum_desc_dialog and enum_desc_python
          if (enumDescValue.enum_desc_all) {
            enumDescValue.enum_desc_dialog = enumDescValue.enum_desc_all
            enumDescValue.enum_desc_python = enumDescValue.enum_desc_all
          }

          // Check to see if enumDescValue.enum_desc_dialog is multi-line
          // if so, add indentation for proper MD rendering
          if (
            enumDescValue.enum_desc_dialog &&
            enumDescValue.enum_desc_dialog.includes('\n')
          ) {
            enumDescValue.enum_desc_dialog = addIndent(
              enumDescValue.enum_desc_dialog,
              2
            )
          }

          if (
            enumDescValue.enum_desc_python &&
            enumDescValue.enum_desc_python.includes('\n')
          ) {
            enumDescValue.enum_desc_python = addIndent(
              enumDescValue.enum_desc_python,
              2
            )
          }
          // Get the enum image if it is defined and add it to a span with
          // data attributes. If you modify this in any way, you must reach
          // out to the GP team to ensure that their parsing logic still works
          // as expected.
          const enumImage = enumItem.enum_image
            ? ` ${addSpan(enumItem.enum_image, 'image', enumName)}`
            : ''
          // Append the enum information to the dialog and python descriptions
          // If you modify this in any way, you must reach out to the GP team to
          // ensure that their parsing logic still works as expected.
          desc.desc_dialog += `- ${addSpan(
            checkedState,
            'name',
            enumName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_dialog),
            'desc',
            enumName
          )}${enumImage}\n\n`
          desc.desc_python += `- ${addSpan(
            escapeSpecialCharactersForMD(`\`${enumName}\``),
            'name',
            enumName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_python),
            'desc',
            enumName
          )}${enumImage}\n\n`
        }
      })
      // Add the closing div tags for dialog and python descriptions
      desc.desc_dialog += '\n\n</div>\n\n'
      desc.desc_python += '\n\n</div>\n\n'
    }

    // Process non Value Table parameters with enums
    else if (Array.isArray(param.enums) && param.datatype !== 'Value Table') {
      // Add the information that is parsed by the GP team to create the
      // strings for the ArcGIS Pro UI. If you modify this in any way,
      // you must reach out to the GP team to ensure that their parsing
      // logic still works as expected.
      // Yes, this is correct. The python name is not translated, so we
      // use it for the lookup for both the dialog and python descriptions.
      desc.desc_dialog += `\n\n<div data-domains="${paramName}">\n\n`
      desc.desc_python += `\n\n<div data-domains="${paramName}">\n\n`

      // Process each of the parameter's enum items
      param.enums.forEach(enumItem => {
        if (typeof enumItem === 'object') {
          // Get the enum name
          const enumName = enumItem.enum_name.trim()
          // Get the enum label
          const enumLabel = enumItem.enum_label.trim()
          // Get the enum description object
          const enumDescValue = enumItem.enum_desc || {}
          // If there is an enum_desc_all, assign it to both
          // the enum_desc_dialog and enum_desc_python
          if (enumDescValue.enum_desc_all) {
            enumDescValue.enum_desc_dialog = enumDescValue.enum_desc_all
            enumDescValue.enum_desc_python = enumDescValue.enum_desc_all
          }

          // Check to see if enumDescValue.enum_desc_dialog is multi-line
          // if so, add indentation for proper MD rendering
          if (
            enumDescValue.enum_desc_dialog &&
            enumDescValue.enum_desc_dialog.includes('\n')
          ) {
            enumDescValue.enum_desc_dialog = addIndent(
              enumDescValue.enum_desc_dialog,
              2
            )
          }

          if (
            enumDescValue.enum_desc_python &&
            enumDescValue.enum_desc_python.includes('\n')
          ) {
            enumDescValue.enum_desc_python = addIndent(
              enumDescValue.enum_desc_python,
              2
            )
          }

          // If there's an enum_image defined, create a span with data attributes
          // to hold the image information.
          // If you modify this in any way, you must reach out to the GP team to
          // ensure that their parsing logic still works as expected.
          const enumImage = enumItem.enum_image
            ? ` ${addSpan(enumItem.enum_image, 'image', enumName)}`
            : ''
          // Append the enum information to the main dialog and python descriptions
          // If you modify this in any way, you must reach out to the GP team to
          // ensure that their parsing logic still works as expected.
          desc.desc_dialog += `- ${addSpan(
            escapeSpecialCharactersForMD(`**${enumLabel}**`),
            'name',
            enumName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_dialog),
            'desc',
            enumName
          )}${enumImage}\n\n`
          desc.desc_python += `- ${addSpan(
            escapeSpecialCharactersForMD(`\`${enumName}\``),
            'name',
            enumName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_python),
            'desc',
            enumName
          )}${enumImage}\n\n`
        }
      })
      // Add the closing div tags for dialog and python descriptions
      desc.desc_dialog += '\n\n</div>\n\n'
      desc.desc_python += '\n\n</div>\n\n'
    }

    // Process Value Table parameters if length is greater than 1
    if (Array.isArray(param.value_table ) && param.value_table.length > 1) {
      // Add the information that is parsed by the GP team to create the
      // strings for the ArcGIS Pro UI. If you modify this in any way,
      // you must reach out to the GP team to ensure that their parsing
      // logic still works as expected.
      desc.desc_dialog = desc.desc_dialog += `\n\n${getToken(
        tokens,
        'gpValueTableColumns'
      )}\n\n`
      desc.desc_python = desc.desc_python += `\n\n${getToken(
        tokens,
        'gpValueTableColumns'
      )}\n\n`
      // Add the information that is parsed by the GP team to create the
      // strings for the ArcGIS Pro UI. If you modify this in any way,
      // you must reach out to the GP team to ensure that their parsing
      // logic still works as expected.
      // Yes, this is correct. The python name is not translated, so we
      // use it for the lookup for both the dialog and python descriptions.
      desc.desc_dialog += `\n\n<div data-columns="${paramName}">\n\n`
      desc.desc_python += `\n\n<div data-columns="${paramName}">\n\n`
      param.value_table.forEach((vtItem, vtIndex) => {
        if (typeof vtItem === 'object') {
          // Get the value table column name, label, and description
          const vtColumnName = vtItem.vt_name.trim()
          const vtColumnLabel = vtItem.vt_label.trim()
          const vtColumnDesc = vtItem.vt_desc
            ? vtItem.vt_desc
            : 'DOCTOPIA_MISSING_VTCOLUMN_DESCRIPTION'
          // Append to parameter dialog description
          desc.desc_dialog += `- ${addSpan(
            escapeSpecialCharactersForMD(`**${vtColumnLabel}**`),
            'column',
            vtIndex
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(vtColumnDesc).replace(),
            'desc',
            vtIndex
          )}\n\n`
          // Append to parameter Python description
          desc.desc_python += `- ${addSpan(
            escapeSpecialCharactersForMD(`\`${vtColumnName}\``),
            'name',
            vtColumnName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(vtColumnDesc),
            'desc',
            vtIndex
          )}\n\n`
          // If this column has vtItem.vt_enums then append the enum
          // values to the descriptions as nested MD list items
          // If you modify this in any way, you must reach out to the GP team
          // to ensure that their parsing logic still works as expected.
          if (Array.isArray(vtItem.vt_enums)) {
            desc.desc_dialog += `\n\n  <div data-domains="${vtIndex}">\n\n`
            desc.desc_python += `\n\n  <div data-domains="${vtIndex}">\n\n`
            vtItem.vt_enums.forEach(vtEnum => {
              if (typeof vtEnum === 'object') {
                // Get the value table enum name, label, and description
                const vtEnumName = vtEnum.vt_enum_name.trim()
                const vtEnumLabel = vtEnum.vt_enum_label.trim()
                const vtEnumDescValue = vtEnum.vt_enum_desc || {}
                if (vtEnumDescValue.vt_enum_desc_all) {
                  vtEnumDescValue.vt_enum_desc_dialog =
                    vtEnumDescValue.vt_enum_desc_all
                      ? vtEnumDescValue.vt_enum_desc_all
                      : 'DOCTOPIA_MISSING_VTENUM_DESCRIPTION'
                  vtEnumDescValue.vt_enum_desc_python =
                    vtEnumDescValue.vt_enum_desc_all
                      ? vtEnumDescValue.vt_enum_desc_all
                      : 'DOCTOPIA_MISSING_VTENUM_DESCRIPTION'
                }

                // Check to see if vtEnumDescValue.vt_enum_desc_dialog is multi-line
                // if so, add indentation for proper MD rendering
                if (
                  vtEnumDescValue.vt_enum_desc_dialog &&
                  vtEnumDescValue.vt_enum_desc_dialog.includes('\n')
                ) {
                  vtEnumDescValue.vt_enum_desc_dialog = addIndent(
                    vtEnumDescValue.vt_enum_desc_dialog,
                    2
                  )
                }

                if (
                  vtEnumDescValue.vt_enum_desc_python &&
                  vtEnumDescValue.vt_enum_desc_python.includes('\n')
                ) {
                  vtEnumDescValue.vt_enum_desc_python = addIndent(
                    vtEnumDescValue.vt_enum_desc_python,
                    2
                  )
                }
                // Append to parameter dialog description
                desc.desc_dialog += `  - ${addSpan(
                  escapeSpecialCharactersForMD(`**${vtEnumLabel}**`),
                  'name',
                  vtEnumName
                )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
                  escapeSpecialCharactersForMD(
                    vtEnumDescValue.vt_enum_desc_dialog
                  ),
                  'desc',
                  vtEnumName
                )}\n\n`
                // Append to parameter Python description
                desc.desc_python += `  - ${addSpan(
                  escapeSpecialCharactersForMD(`\`${vtEnumName}\``),
                  'name',
                  vtEnumName
                )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
                  escapeSpecialCharactersForMD(
                    vtEnumDescValue.vt_enum_desc_python
                  ),
                  'desc',
                  vtEnumName
                )}\n\n`
              }
            })
            // Add the closing div tags for dialog and python descriptions
            desc.desc_dialog += '\n\n  </div>\n\n'
            desc.desc_python += '\n\n  </div>\n\n'
          }
        }
      })
    }

    if (param['expression_override']) {
      param.expression_override = param.expression_override.trim()
    }
  }
  return
}

function generateRelatedTopicsMD (model) {
  if (Array.isArray(model.related_topics)) {
    const relatedMd = model.related_topics
      .map(topic => {
        if (typeof topic === 'object' && topic.link) {
          return `- ${topic.link}\n`
        }
        return ''
      })
      .filter(Boolean)
      .join('')
    if (relatedMd) {
      model.related_topics_md = relatedMd
    }
  }
}

function generateSimplePythonAndDialogDescription (param, tokens) {
  // Generates the Python and Dialog data for derived output parameters
  // These are much less complex than regular parameters since they don't
  // have enums or value tables. All of their formatting is handled in the
  // HTML template.
  paramName = param.name?.trim() || ''
  if (typeof param === 'object' && typeof param.desc === 'object') {
    const desc = param.desc
    desc.desc_dialog = desc.desc_dialog || desc.desc_all || ''
    desc.desc_python = desc.desc_python || desc.desc_all || ''

    if (Array.isArray(param.enums)) {
      // Add the information that is parsed by the GP team to create the
      // strings for the ArcGIS Pro UI. If you modify this in any way,
      // you must reach out to the GP team to ensure that their parsing
      // logic still works as expected.
      // Yes, this is correct. The python name is not translated, so we
      // use it for the lookup for both the dialog and python descriptions.
      desc.desc_dialog += `\n\n<div data-domains="${paramName}">\n\n`
      desc.desc_python += `\n\n<div data-domains="${paramName}">\n\n`

      // Process each of the parameter's enum items
      param.enums.forEach(enumItem => {
        if (typeof enumItem === 'object') {
          // Get the enum name
          const enumName = enumItem.enum_name.trim()
          // Get the enum label
          const enumLabel = enumItem.enum_label.trim()
          // Get the enum description object
          const enumDescValue = enumItem.enum_desc || {}
          // If there is an enum_desc_all, assign it to both
          // the enum_desc_dialog and enum_desc_python
          if (enumDescValue.enum_desc_all) {
            enumDescValue.enum_desc_dialog = enumDescValue.enum_desc_all
            enumDescValue.enum_desc_python = enumDescValue.enum_desc_all
          }

          // Check to see if enumDescValue.enum_desc_dialog is multi-line
          // if so, add indentation for proper MD rendering
          if (
            enumDescValue.enum_desc_dialog &&
            enumDescValue.enum_desc_dialog.includes('\n')
          ) {
            enumDescValue.enum_desc_dialog = addIndent(
              enumDescValue.enum_desc_dialog,
              2
            )
          }

          if (
            enumDescValue.enum_desc_python &&
            enumDescValue.enum_desc_python.includes('\n')
          ) {
            enumDescValue.enum_desc_python = addIndent(
              enumDescValue.enum_desc_python,
              2
            )
          }

          // If there's an enum_image defined, create a span with data attributes
          // to hold the image information.
          // If you modify this in any way, you must reach out to the GP team to
          // ensure that their parsing logic still works as expected.
          const enumImage = enumItem.enum_image
            ? ` ${addSpan(enumItem.enum_image, 'image', enumName)}`
            : ''
          // Append the enum information to the main dialog and python descriptions
          // If you modify this in any way, you must reach out to the GP team to
          // ensure that their parsing logic still works as expected.
          desc.desc_dialog += `- ${addSpan(
            escapeSpecialCharactersForMD(`**${enumLabel}**`),
            'name',
            enumName
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_dialog),
            'desc',
            enumName
          )}${enumImage}\n\n`
          desc.desc_python += `- ${addSpan(
            escapeSpecialCharactersForMD(`\`${enumName}\``),
            'name',
            enumName,
            'label',
            enumLabel
          )}${getToken(tokens, 'gpEnumSeparator')}${addSpan(
            escapeSpecialCharactersForMD(enumDescValue.enum_desc_python),
            'desc',
            enumName
          )}${enumImage}\n\n`
        }
      })
      // Add the closing div tags for dialog and python descriptions
      desc.desc_dialog += '\n\n</div>\n\n'
      desc.desc_python += '\n\n</div>\n\n'
    }
  }
}

function generateToolSyntax (toolName, toolboxAlias, params) {
  // Generates the Python Syntax for the Geoprocessing Tool
  // and assigns it to python_syntax

  // 1. Determine the way to start the syntax based on toolbox alias
  let python_syntax =
    toolboxAlias === 'sa' || toolboxAlias === 'ia'
      ? `\`${toolName}(`
      : `\`arcpy.${toolboxAlias}.${toolName}(`

  // 2. Add each parameter to the python_syntax
  params.forEach((param, index) => {
    if (typeof param === 'object') {
      // a. Trim the parameter name
      const paramName = param.name?.trim() || ''
      // b. Determine if the parameter is required
      const paramRequired = param.required || false
      // c. Create add curly braces around the parameter name if the
      //    parameter is not required
      const paramNameSyntax = paramRequired ? paramName : `{${paramName}}`
      // d. Append the parameter name syntax to the model.python_syntax
      //    and add the closing backtick if this is the last parameter
      python_syntax +=
        paramNameSyntax + (index === params.length - 1 ? ')`' : ', ')
    }
  })
  return python_syntax
}

function getToken (tokens, key, defaultValue = '') {
  return tokens[key] || defaultValue
}

function hasNonEmptyArray (array) {
  return Array.isArray(array) && array.length > 0
}

function hasEnvironmentSpecialCases (environments) {
  // Check to see if environments is an array prior to checking for special cases
  // this handles environments when it's undefined or null and when it's not an array
  return (
    Array.isArray(environments) &&
    environments.some(env => env.special_case)
  )
}

function isModelBuilderTool (model) {
  return model.toolbox_alias === 'mb'
}
