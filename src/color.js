export function grayscale (fraction) {
  const lightness = Math.round(fraction * 255)
  return [lightness, lightness, lightness]
}

export function grayscaleInverted (fraction) {
  const darkness = Math.round((1 - fraction) * 255)
  return [darkness, darkness, darkness]
}

export function hue (fraction) {
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
      return [0, 0, 0]
  }
}
