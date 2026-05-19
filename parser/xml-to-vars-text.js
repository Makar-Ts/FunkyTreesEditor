/**
 * @param {Document} xml 
 * @param {boolean} format 
 */
export function fromXMLtoVariablesText(xml, format) {
  let output = [];

  for (const setter of xml.querySelectorAll('Aircraft > Variables > Setter')) {
    const name = setter.attributes.getNamedItem('variable')?.value;
    const func = setter.attributes.getNamedItem('function')?.value;
    const priority = Number(setter.attributes.getNamedItem('priority')?.value);
    const activator = setter.attributes.getNamedItem('activator')?.value;

    if (!name) continue;
    if (!priority && !activator) {
      output.push(`|> ${name} |= ${func}`)
      continue;
    }
    
    if (format) {
      if (priority && !activator) {
        output.push(`|> ${name}\n\t; ${priority}\n|= ${func}`)
      } else if (activator) {
        output.push(`|> ${name}\n\t; ${Number(priority)}\n\t; ${activator}\n|= ${func}`)
      }
    } else {
      if (priority && !activator) {
        output.push(`|> ${name}; ${priority} |= ${func}`)
      } else if (activator) {
        output.push(`|> ${name}; ${Number(priority)}; ${activator} |= ${func}`)
      }
    }
  }

  return output.join('\n\n')
}