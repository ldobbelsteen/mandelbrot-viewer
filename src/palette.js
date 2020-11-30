export const palettes = [
  'Grayscale',
  'Grayscale cyclic',
  'Hue circle',
  'Hue circle cyclic'
]

export default (name) => {
  switch (name) {
    case 'Grayscale': return grayscale(false)
    case 'Grayscale cyclic': return grayscale(true)
    case 'Hue circle': return hueCircle(false)
    case 'Hue circle cyclic': return hueCircle(true)
    default: throw 'Invalid palette name!'
  }
}

function grayscale (cyclic) {
  return (fraction) => {
    var lightness
    if (cyclic) {
      lightness = 255 * (1 - Math.abs(2 * fraction - 1))
    } else {
      lightness = 255 * fraction
    }
    return [lightness, lightness, lightness]
  }
}

function hueCircle (cyclic) {
  return (fraction) => {
    const section = fraction * 6
    const intensity = 255 * (1 - Math.abs((section % 2) - 1))
    switch (Math.floor(section)) {
      case 0:
        return [255, intensity, 0]
      case 1:
        return [intensity, 255, 0]
      case 2:
        return [0, 255, intensity]
      case 3:
        return [0, intensity, 255]
      case 4:
        return [intensity, 0, 255]
      case 5:
        return [255, 0, intensity]
      case 6:
        if (cyclic) {
          return [255, intensity, 0]
        } else {
          return [0, 0, 0]
        }
    }
  }
}
