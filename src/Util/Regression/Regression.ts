type Options = {period: null; precision: number; order: number};

const DEFAULT_OPTIONS: Options = {order: 2, precision: 2, period: null};

/**
 * Определение коэффициента детерминации (r^2) соответствия на основе наблюдений
 * и прогнозов.
 *
 * @param {Array<Array<number>>} data - Пары наблюдаемых значений x-y
 * @param {Array<Array<number>>} results - Пары наблюдаемых прогнозируемых значений x-y
 *
 * @return {number} - Значение r^2 или NaN, если оно не может быть вычислено.
 */
function determinationCoefficient(
  data: Array<Array<number>>,
  results: Array<Array<number>>,
) {
  const predictions: Array<Array<number>> = [];
  const observations: Array<Array<number>> = [];

  data.forEach((d, i) => {
    if (d[1] !== null) {
      observations.push(d);
      predictions.push(results[i]);
    }
  });

  const sum = observations.reduce((a, observation) => a + observation[1], 0);
  const mean = sum / observations.length;

  const ssyy = observations.reduce((a, observation) => {
    const difference = observation[1] - mean;
    return a + difference * difference;
  }, 0);

  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + residual * residual;
  }, 0);

  return 1 - sse / ssyy;
}

/**
 * Определите решение системы линейных уравнений A * x = b, используя
 * Исключение по Гауссу.
 *
 * @param {Array<Array<number>>} input - Двумерная матрица данных в виде основной строки [ A | b ]
 * @param {number} order - Для скольких степеней нужно решить
 *
 * @return {Array<number>} - Вектор матрицы нормализованных коэффициентов решения (x)
 */
function gaussianElimination(input: Array<Array<number>>, order: number) {
  const matrix = input;
  const n = input.length - 1;
  const coefficients: Array<number> = [order];

  for (let i = 0; i < n; i++) {
    let maxrow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[i][j]) > Math.abs(matrix[i][maxrow])) {
        maxrow = j;
      }
    }

    for (let k = i; k < n + 1; k++) {
      const tmp = matrix[k][i];
      matrix[k][i] = matrix[k][maxrow];
      matrix[k][maxrow] = tmp;
    }

    for (let j = i + 1; j < n; j++) {
      for (let k = n; k >= i; k--) {
        matrix[k][j] -= (matrix[k][i] * matrix[i][j]) / matrix[i][i];
      }
    }
  }

  for (let j = n - 1; j >= 0; j--) {
    let total = 0;
    for (let k = j + 1; k < n; k++) {
      total += matrix[k][j] * coefficients[k];
    }

    coefficients[j] = (matrix[n][j] - total) / matrix[j][j];
  }

  return coefficients;
}

/**
 * Округлить число с точностью, указанной в количестве знаков после запятой
 *
 * @param {number} number - Число, которое нужно округлить
 * @param {number} precision - Количество знаков после запятой, округляемое до:
 *                             > 0 означает десятичные дроби, < 0 означает степени 10
 *
 *
 * @return {number} - Число, округленное
 */
function round(number: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

/**
 * Набор всех методов подгонки
 *
 * @namespace
 */
namespace Regression {
  export function linear(
    data: Array<Array<number>>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    const sum = [0, 0, 0, 0, 0];
    let len = 0;

    for (let n = 0; n < data.length; n++) {
      if (data[n][1] !== null) {
        len++;
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0];
        sum[3] += data[n][0] * data[n][1];
        sum[4] += data[n][1] * data[n][1];
      }
    }

    const run = len * sum[2] - sum[0] * sum[0];
    const rise = len * sum[3] - sum[0] * sum[1];
    const gradient = run === 0 ? 0 : round(rise / run, options.precision);
    const intercept = round(
      sum[1] / len - (gradient * sum[0]) / len,
      options.precision,
    );

    const predict = (x: number) => [
      round(x, options.precision),
      round(gradient * x + intercept, options.precision),
    ];

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [gradient, intercept],
      r2: round(determinationCoefficient(data, points), options.precision),
      string:
        intercept === 0
          ? `y = ${gradient}x`
          : `y = ${gradient}x + ${intercept}`,
    };
  }

  export function exponential(
    data: Array<Array<number>>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    const sum = [0, 0, 0, 0, 0, 0];

    for (let n = 0; n < data.length; n++) {
      if (data[n][1] !== null) {
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0] * data[n][1];
        sum[3] += data[n][1] * Math.log(data[n][1]);
        sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
        sum[5] += data[n][0] * data[n][1];
      }
    }

    const denominator = sum[1] * sum[2] - sum[5] * sum[5];
    const a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
    const b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;
    const coeffA = round(a, options.precision);
    const coeffB = round(b, options.precision);
    const predict = (x: number) => [
      round(x, options.precision),
      round(coeffA * Math.exp(coeffB * x), options.precision),
    ];

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [coeffA, coeffB],
      string: `y = ${coeffA}e^(${coeffB}x)`,
      r2: round(determinationCoefficient(data, points), options.precision),
    };
  }

  export function logarithmic(
    data: Array<Array<number>>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    const sum = [0, 0, 0, 0];
    const len = data.length;

    for (let n = 0; n < len; n++) {
      if (data[n][1] !== null) {
        sum[0] += Math.log(data[n][0]);
        sum[1] += data[n][1] * Math.log(data[n][0]);
        sum[2] += data[n][1];
        sum[3] += Math.log(data[n][0]) ** 2;
      }
    }

    const a =
      (len * sum[1] - sum[2] * sum[0]) / (len * sum[3] - sum[0] * sum[0]);
    const coeffB = round(a, options.precision);
    const coeffA = round((sum[2] - coeffB * sum[0]) / len, options.precision);

    const predict = (x: number) => [
      round(x, options.precision),
      round(
        round(coeffA + coeffB * Math.log(x), options.precision),
        options.precision,
      ),
    ];

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [coeffA, coeffB],
      string: `y = ${coeffA} + ${coeffB} ln(x)`,
      r2: round(determinationCoefficient(data, points), options.precision),
    };
  }

  export function power(
    data: Array<Array<number>>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    const sum = [0, 0, 0, 0, 0];
    const len = data.length;

    for (let n = 0; n < len; n++) {
      if (data[n][1] !== null) {
        sum[0] += Math.log(data[n][0]);
        sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
        sum[2] += Math.log(data[n][1]);
        sum[3] += Math.log(data[n][0]) ** 2;
      }
    }

    const b = (len * sum[1] - sum[0] * sum[2]) / (len * sum[3] - sum[0] ** 2);
    const a = (sum[2] - b * sum[0]) / len;
    const coeffA = round(Math.exp(a), options.precision);
    const coeffB = round(b, options.precision);

    const predict = (x: number) => [
      round(x, options.precision),
      round(round(coeffA * x ** coeffB, options.precision), options.precision),
    ];

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [coeffA, coeffB],
      string: `y = ${coeffA}x^${coeffB}`,
      r2: round(determinationCoefficient(data, points), options.precision),
    };
  }

  export function polynomial(
    data: Array<Array<number>>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    const lhs = [];
    const rhs = [];
    let a = 0;
    let b = 0;
    const len = data.length;
    const k = options.order + 1;

    for (let i = 0; i < k; i++) {
      for (let l = 0; l < len; l++) {
        if (data[l][1] !== null) {
          a += data[l][0] ** i * data[l][1];
        }
      }

      lhs.push(a);
      a = 0;

      const c = [];
      for (let j = 0; j < k; j++) {
        for (let l = 0; l < len; l++) {
          if (data[l][1] !== null) {
            b += data[l][0] ** (i + j);
          }
        }
        c.push(b);
        b = 0;
      }
      rhs.push(c);
    }
    rhs.push(lhs);

    const coefficients = gaussianElimination(rhs, k).map(v =>
      round(v, options.precision),
    );

    const predict = (x: number) => [
      round(x, options.precision),
      round(
        coefficients.reduce((sum, coeff, pow) => sum + coeff * x ** pow, 0),
        options.precision,
      ),
    ];

    const points = data.map(point => predict(point[0]));

    let string = 'y = ';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (i > 1) {
        string += `${coefficients[i]}x^${i} + `;
      } else if (i === 1) {
        string += `${coefficients[i]}x + `;
      } else {
        string += coefficients[i];
      }
    }

    return {
      string,
      points,
      predict,
      equation: [...coefficients].reverse(),
      r2: round(determinationCoefficient(data, points), options.precision),
    };
  }
}

export default Regression;
