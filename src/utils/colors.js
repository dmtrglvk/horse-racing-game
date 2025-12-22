const COLOR_MAP = {
  'Red': '#ff4444',
  'Blue': '#4444ff',
  'Yellow': '#ffd700',
  'Green': '#44ff44',
  'Purple': '#aa44ff',
  'Orange': '#ff8844',
  'Pink': '#ff44aa',
  'Cyan': '#44ffff',
  'Magenta': '#ff44ff',
  'Lime': '#88ff44',
  'Teal': '#44ffaa',
  'Indigo': '#8844ff',
  'Brown': '#aa6644',
  'Grey': '#888888',
  'Black': '#222222',
  'White': '#ffffff',
  'Coral': '#ff7f50',
  'Gold': '#ffd700',
  'Silver': '#c0c0c0',
  'Navy': '#000080'
}

export function getColorValue(colorName) {
  return COLOR_MAP[colorName]
}