/**
 * @param {Document} xml
 * @returns {{
 *   name: string,
 *   tags: string[],
 *   url: string,
 *   theme: string,
 *   size: { x:number, y:number, z:number },
 *   parts: number,
 *   connections: number,
 *   bodies: number,
 *   variables: number,
 *   specifications: {
 *     emptyWeight:number,
 *     loadedWeight:number,
 *     fuelAmount:number,
 *     drag:number,
 *     wingSpan:number,
 *     length:number,
 *     height:number
 *   }
 * }}
 */
export function fromXMLtoCraftInfo(xml) {
  const aircraft = xml.querySelector('Aircraft');
  const specs = xml.querySelector('Specifications');

  if (!aircraft) {
    throw new Error('Aircraft node not found');
  }

  const attr = (node, name, fallback = null) => {
    return node?.getAttribute(name) ?? fallback;
  };

  const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    name: attr(aircraft, 'name', ''),
    tags: attr(aircraft, 'tags', '')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean),

    url: attr(aircraft, 'url', ''),
    theme: attr(aircraft, 'theme', ''),

    size: {
      x: num(attr(aircraft, 'size')?.split(',')[0]),
      y: num(attr(aircraft, 'size')?.split(',')[1]),
      z: num(attr(aircraft, 'size')?.split(',')[2]),
    },

    parts: xml.querySelectorAll('Parts > Part').length,
    connections: xml.querySelectorAll('Connections > Connection').length,
    bodies: xml.querySelectorAll('Bodies > Body').length,
    variables: xml.querySelectorAll('Variables > Setter').length,

    specifications: {
      emptyWeight: num(attr(specs, 'EmptyWeight')),
      loadedWeight: num(attr(specs, 'LoadedWeight')),
      fuelAmount: num(attr(specs, 'FuelAmount')),
      drag: num(attr(specs, 'Drag')),
      wingSpan: num(attr(specs, 'WingSpan')),
      length: num(attr(specs, 'Length')),
      height: num(attr(specs, 'Height')),
    }
  };
}