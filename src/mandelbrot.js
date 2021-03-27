/**
 * Return the Mandelbrot escape time algorithm that corresponds to the given
 * power. It also hard codes the maximum iteration count into the algorithm for
 * performance. Optimized algorithms are preferred and are given priority.
 * 
 * Each of the algorithms returns the ratio between the number of iterations it
 * took to reach a modulus of 2 or more and the maximum iteration count. It
 * returns 1 if the point didn't escape within the maximum iterations. As such
 * the return value's domain is guaranteed to be [0..1]
 */
export function getAlgorithm(maxIteration, power) {
	if (power === 2) {
		return mandelbrot(maxIteration)
	} else if (power === 3) {
		return multibrot3(maxIteration)
	} else if (power < 0) {
		return minibrot(maxIteration, power)
	} else {
		return multibrot(maxIteration, power)
	}
}

function mandelbrot(maxIteration) {
	const inCardioid = (real, imaginary) => {
		const realCenter = real - 0.25
		const imaginarySquared = Math.pow(imaginary, 2)
		const circle = Math.pow(realCenter, 2) + imaginarySquared
		const cardioid = circle * (circle + realCenter)
		const inCardioid = cardioid <= 0.25 * imaginarySquared
		return inCardioid
	}

	const inBulb = (real, imaginary) => {
		const bulb = Math.pow(real + 1, 2) + Math.pow(imaginary, 2)
		const inBulb = bulb <= 0.0625
		return inBulb
	}

	return (real, imaginary) => {
		if (inCardioid(real, imaginary)) return 1
		if (inBulb(real, imaginary)) return 1

		let x = real
		let y = imaginary
		let iteration = 0

		let x2 = Math.pow(x, 2)
		let y2 = Math.pow(y, 2)

		while (x2 + y2 <= 4) {
			if (++iteration === maxIteration) return 1
			y = 2 * x * y + imaginary
			x = x2 - y2 + real
			x2 = Math.pow(x, 2)
			y2 = Math.pow(y, 2)
		}

		iteration += 1 - Math.log2(Math.log2(x2 + y2))
		if (iteration < 0) return 0

		return iteration / maxIteration
	}
}

function multibrot3(maxIteration) {
	return (real, imaginary) => {
		let x = real
		let y = imaginary
		let iteration = 0

		let x2 = Math.pow(x, 2)
		let y2 = Math.pow(y, 2)

		while (x2 + y2 <= 4) {
			if (++iteration === maxIteration) return 1
			x = x2 * x - 3 * x * y2 + real
			y = 3 * x2 * y - y2 * y + imaginary
			x2 = Math.pow(x, 2)
			y2 = Math.pow(y, 2)
		}

		iteration -= Math.log2(0.5 * Math.log2(x2 + y2)) / Math.log2(3)
		if (iteration < 0) return 0

		return iteration / maxIteration
	}
}

function multibrot(maxIteration, power) {
	return (real, imaginary) => {
		let x = real
		let y = imaginary
		let iteration = 0

		let hypo = Math.pow(x, 2) + Math.pow(y, 2)
		let arctan = Math.atan2(y, x)

		while (hypo <= 4) {
			if (++iteration === maxIteration) return 1
			x = Math.pow(hypo, power / 2) * Math.cos(power * arctan) + real
			y = Math.pow(hypo, power / 2) * Math.sin(power * arctan) + imaginary
			hypo = Math.pow(x, 2) + Math.pow(y, 2)
			arctan = Math.atan2(y, x)
		}

		iteration -= Math.log2(0.5 * Math.log2(hypo)) / Math.log2(power)
		if (iteration < 0) return 0

		return iteration / maxIteration
	}
}

function minibrot(maxIteration, power) {
	return (real, imaginary) => {
		let x = real
		let y = imaginary
		let iteration = 0

		let hypo = Math.pow(x, 2) + Math.pow(y, 2)
		let arctan = Math.atan2(y, x)

		while (hypo <= 4) {
			if (++iteration === maxIteration) return 1
			x = Math.pow(hypo, power / 2) * Math.cos(power * arctan) + real
			y = Math.pow(hypo, power / 2) * Math.sin(power * arctan) + imaginary
			hypo = Math.pow(x, 2) + Math.pow(y, 2)
			arctan = Math.atan2(y, x)
		}

		return iteration / maxIteration
	}
}
