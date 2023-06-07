type Config = {string: boolean; decimals: number};

type Opts = {returnString: boolean; returnDecimals: number};

namespace UtilCorrelation {
  function preciseRound(num: number, dec: number) {
    return (
      Math.round(num * 10 ** dec + (num >= 0 ? 1 : -1) * 0.0001) / 10 ** dec
    );
  }
  function manageInput(
    x: Array<number>,
    y: Array<number>,
    config?: Config,
  ): [Array<Array<number>>, Opts] {
    let arrays = [x, y];

    const opts = {
      returnString: config?.string ?? false,
      returnDecimals: config?.decimals ?? 9,
    };

    return [arrays, opts];
  }

  function isObject(obj: unknown) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  }

  function isNumber(n: unknown) {
    return typeof n === 'number' && n === Number(n) && Number.isFinite(n);
  }
  function checkInput(args: Array<Array<number>>) {
    // only two inputs exist
    if (args.length !== 2) {
      return false;
    }
    const [x, y] = args;
    // console.log('tea: ', y);
    // inputs are not falsy
    if (!x || !y) {
      return false;
    }
    // they are arrays
    if (!Array.isArray(x) || !Array.isArray(y)) {
      return false;
    }
    // length is not 0
    if (!x.length || !y.length) {
      return false;
    }
    // length is the same
    if (x.length !== y.length) {
      return false;
    }
    // all the elems in the arrays are numbers
    if (x.concat(y).find(el => !isNumber(el))) {
      return false;
    }
    // 👌 all good!
    return true;
  }
  function average(values: Array<number>) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  // будет вызывать его только с _safe_ массивом значений
  function stdDeviation(values: Array<number>) {
    const µ = average(values);
    const addedSquareDiffs = values
      .map(val => val - µ)
      .map(diff => diff ** 2)
      .reduce((sum, v) => sum + v, 0);
    const variance = addedSquareDiffs / (values.length - 1);
    return Math.sqrt(variance);
  }

  export function correlation(
    argX: Array<number>,
    argY: Array<number>,
    config?: Config,
  ) {
    const [arrays, options] = manageInput(argX, argY, config);

    const isInputValid = checkInput(arrays);
    if (!isInputValid) {
      throw new Error('Input not valid');
    }

    const [x, y] = arrays;

    const µ = {x: average(x), y: average(y)};
    const s = {x: stdDeviation(x), y: stdDeviation(y)};

    const addedMultipliedDifferences = x
      .map((val, i) => (val - µ.x) * (y[i] - µ.y))
      .reduce((sum, v) => sum + v, 0);

    const dividedByDevs = addedMultipliedDifferences / (s.x * s.y);

    const r = dividedByDevs / (x.length - 1);

    // return string?
    // default return
    return options.returnString
      ? r.toFixed(options.returnDecimals)
      : preciseRound(r, options.returnDecimals);
  }
}

export default UtilCorrelation;
