export const NegativeZero = {
  test(x) {
    return Object.is(x, -0);
  },
  encode() {
    return undefined;
  },
  decode() {
    return -0;
  },
};

export const Infinity = {
  test(x) {
    return x === Number.POSITIVE_INFINITY;
  },
  encode() {
    return undefined;
  },
  decode() {
    return Number.POSITIVE_INFINITY;
  },
};

export const NegativeInfinity = {
  test(x) {
    return x === Number.NEGATIVE_INFINITY;
  },
  encode() {
    return undefined;
  },
  decode() {
    return Number.NEGATIVE_INFINITY;
  },
};

export const NaN = {
  test(x) {
    return Number.isNaN(x);
  },
  encode() {
    return undefined;
  },
  decode() {
    return Number.NaN;
  },
};
