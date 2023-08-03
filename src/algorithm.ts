export type Algorithm = (real: number, imaginary: number) => number;

/**
 * Get the Mandelbrot escape time algorithm associated with a power and the
 * maximum number of iterations. These variables are baked in for performance.
 * There are two generic algorithms for nonnegative and negative powers, and
 * some optimized ones for specific powers which have priority over the prior.
 *
 * The algorithms return the ratio between the number of iterations it took to
 * reach a modulus of 2 or more and the maximum iteration count. It returns 1
 * if the point didn't escape within the maximum iterations. As such, the
 * returned value's domain is guaranteed to be [0..1].
 */
export function getAlgorithm(
  maxIterations: number,
  mandelbrotPower: number,
): Algorithm {
  if (mandelbrotPower === 2) {
    return regularMandelbrot(maxIterations);
  } else if (mandelbrotPower === 3) {
    return threeMandelbrot(maxIterations);
  } else if (mandelbrotPower < 0) {
    return negativeMandelbrot(maxIterations, mandelbrotPower);
  } else {
    return nonnegativeMandelbrot(maxIterations, mandelbrotPower);
  }
}

function regularMandelbrot(maxIterations: number) {
  const inCardioid = (real: number, imaginary: number) => {
    const realCenter = real - 0.25;
    const imaginarySquared = Math.pow(imaginary, 2);
    const circle = Math.pow(realCenter, 2) + imaginarySquared;
    const cardioid = circle * (circle + realCenter);
    const inCardioid = cardioid <= 0.25 * imaginarySquared;
    return inCardioid;
  };

  const inBulb = (real: number, imaginary: number) => {
    const bulb = Math.pow(real + 1, 2) + Math.pow(imaginary, 2);
    const inBulb = bulb <= 0.0625;
    return inBulb;
  };

  return (real: number, imaginary: number) => {
    if (inCardioid(real, imaginary)) return 1;
    if (inBulb(real, imaginary)) return 1;

    let x = real;
    let y = imaginary;
    let iteration = 0;

    let x2 = Math.pow(x, 2);
    let y2 = Math.pow(y, 2);

    while (x2 + y2 <= 4) {
      if (++iteration === maxIterations) return 1;
      y = 2 * x * y + imaginary;
      x = x2 - y2 + real;
      x2 = Math.pow(x, 2);
      y2 = Math.pow(y, 2);
    }

    iteration += 1 - Math.log2(Math.log2(x2 + y2));
    if (iteration < 0) return 0;

    return iteration / maxIterations;
  };
}

function threeMandelbrot(maxIterations: number) {
  return (real: number, imaginary: number) => {
    let x = real;
    let y = imaginary;
    let iteration = 0;

    let x2 = Math.pow(x, 2);
    let y2 = Math.pow(y, 2);

    while (x2 + y2 <= 4) {
      if (++iteration === maxIterations) return 1;
      x = x2 * x - 3 * x * y2 + real;
      y = 3 * x2 * y - y2 * y + imaginary;
      x2 = Math.pow(x, 2);
      y2 = Math.pow(y, 2);
    }

    iteration -= Math.log2(0.5 * Math.log2(x2 + y2)) / Math.log2(3);
    if (iteration < 0) return 0;

    return iteration / maxIterations;
  };
}

function nonnegativeMandelbrot(maxIterations: number, power: number) {
  return (real: number, imaginary: number) => {
    let x = real;
    let y = imaginary;
    let iteration = 0;

    let hypo = Math.pow(x, 2) + Math.pow(y, 2);
    let arctan = Math.atan2(y, x);

    while (hypo <= 4) {
      if (++iteration === maxIterations) return 1;
      x = Math.pow(hypo, power / 2) * Math.cos(power * arctan) + real;
      y = Math.pow(hypo, power / 2) * Math.sin(power * arctan) + imaginary;
      hypo = Math.pow(x, 2) + Math.pow(y, 2);
      arctan = Math.atan2(y, x);
    }

    iteration -= Math.log2(0.5 * Math.log2(hypo)) / Math.log2(power);
    if (iteration < 0) return 0;

    return iteration / maxIterations;
  };
}

function negativeMandelbrot(maxIterations: number, power: number) {
  return (real: number, imaginary: number) => {
    let x = real;
    let y = imaginary;
    let iteration = 0;

    let hypo = Math.pow(x, 2) + Math.pow(y, 2);
    let arctan = Math.atan2(y, x);

    while (hypo <= 4) {
      if (++iteration === maxIterations) return 1;
      x = Math.pow(hypo, power / 2) * Math.cos(power * arctan) + real;
      y = Math.pow(hypo, power / 2) * Math.sin(power * arctan) + imaginary;
      hypo = Math.pow(x, 2) + Math.pow(y, 2);
      arctan = Math.atan2(y, x);
    }

    return iteration / maxIterations;
  };
}
