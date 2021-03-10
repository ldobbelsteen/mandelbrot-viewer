/**
 * Set of available palettes for coloring the Mandelbrot set. A palette
 * algorithm can be retrieved by its name and a list of the names of the
 * available palettes can also be retrieved.
 */
const palettes = {
	"Hue circle": hueCircle(false),
	"Hue circle cyclic": hueCircle(true),
	"Grayscale": grayscale(false),
	"Grayscale cyclic": grayscale(true),
}

export function listPalettes () {
	return Object.keys(palettes)
}

export function getPalette (name) {
	return palettes[name]
}

function grayscale (cyclic) {
	return (fraction) => {
		let lightness
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
