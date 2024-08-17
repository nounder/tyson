import { toStringTag } from "../utils.ts";

export default {
  BigIntObject: {
    test(x) {
      return typeof x === "object" &&
        x?.constructor === BigInt &&
        typeof x.valueOf() === "bigint";
    },
    encode: String,
    decode(x) {
      return new Object(BigInt(x));
    },
  },

  StringObject: {
    test(x) {
      return toStringTag(x) === "String" && typeof x === "object";
    },
    encode: String,
    decode(x) {
      return new String(x);
    },
  },

  BooleanObject: {
    test(x) {
      return toStringTag(x) === "Boolean" &&
        typeof x === "object";
    },
    encode: Boolean,
    decode(x) {
      return new Boolean(x);
    },
  },

  NumberObject: {
    test(x) {
      return toStringTag(x) === "Number" && typeof x === "object";
    },
    encode: Number,
    decode(n) {
      return new Number(n);
    },
  },
};
