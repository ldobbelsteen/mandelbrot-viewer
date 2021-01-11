import Mandelbrot from "./mandelbrot.js"
import Palette from "./palette.js"

var mandelbrot
var palette

onmessage = (event) => {
	if (event.data.settings) {
		mandelbrot = Mandelbrot(event.data.maxIteration, event.data.power)
		palette = Palette(event.data.palette)
	} else {
		const { image, real, imaginary, size } = event.data
		const dimensions = image.width
		const scale = size / dimensions

		let index = 0
		let currentReal
		let currentImaginary

		currentImaginary = imaginary
		for (let y = 0; y < dimensions; y++) {
			currentReal = real
			for (let x = 0; x < dimensions; x++) {
				const fraction = mandelbrot(currentReal, currentImaginary)
				const rgb = palette(fraction)
				image.data[index++] = rgb[0]
				image.data[index++] = rgb[1]
				image.data[index++] = rgb[2]
				image.data[index++] = 255
				currentReal += scale
			}
			currentImaginary -= scale
		}

		postMessage(image, [image.data.buffer])
	}
}
