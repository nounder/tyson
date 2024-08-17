import { toStringTag } from "../utils.ts";

export const BigIntObject = {
  test(x) {
    return typeof x === "object" &&
      x?.constructor === BigInt &&
      typeof x.valueOf() === "bigint";
  },
  encode: String,
  decode(x) {
    return new Object(BigInt(x));
  },
};

export const StringObject = {
  test(x) {
    return toStringTag(x) === "String" && typeof x === "object";
  },
  encode: String,
  decode(x) {
    return new String(x);
  },
};

export const BooleanObject = {
  test(x) {
    return toStringTag(x) === "Boolean" &&
      typeof x === "object";
  },
  encode: Boolean,
  decode(x) {
    return new Boolean(x);
  },
};

export const NumberObject = {
  test(x) {
    return toStringTag(x) === "Number" && typeof x === "object";
  },
  encode: Number,
  decode(n) {
    return new Number(n);
  },
};
