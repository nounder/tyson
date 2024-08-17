import { toStringTag } from "./utils.ts";

export default {
  Undefined: {
    test(x) {
      return x === undefined;
    },
    encode: () => undefined,
    decode: () => undefined,
  },

  BigInt: {
    test(x) {
      return typeof x === "bigint";
    },
    encode: String,
    decode: BigInt,
  },

  Date: {
    test(x) {
      return toStringTag(x) === "Date";
    },
    encode(x) {
      const time = x.getTime();

      if (Number.isNaN(time)) {
        return "NaN";
      }

      return time;
    },
    decode(x) {
      if (x === "NaN") {
        return new Date(Number.NaN);
      }
      return new Date(x);
    },
  },

  Error: {
    test(x) {
      return toStringTag(x) === "Error";
    },
    encode(x) {
      return {
        name: x.name,
        message: x.message,
        stack: x.stack,
      };
    },
    decode(x) {
      const e = new Error(x.message);
      e.name = x.name;
      e.stack = x.stack;

      return e;
    },
  },

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

  Map: {
    test(x) {
      return toStringTag(x) === "Map";
    },
    encode(x) {
      return [...x.entries()];
    },
    decode(x) {
      return new Map(x);
    },
  },

  Set: {
    test(x) {
      return toStringTag(x) === "Set";
    },
    encode(x) {
      return [...x.values()];
    },
    decode(x) {
      return new Set(x);
    },
  },

  RegExp: {
    test(x) {
      return toStringTag(x) === "RegExp";
    },

    encode(rexp) {
      return {
        source: rexp.source,
        flags: (rexp.global ? "g" : "") +
          (rexp.ignoreCase ? "i" : "") +
          (rexp.multiline ? "m" : "") +
          (rexp.sticky ? "y" : "") +
          (rexp.unicode ? "u" : ""),
      };
    },

    decode(x) {
      return new RegExp(x.source, x.flags);
    },
  },

  NegativeZero: {
    test(x) {
      return Object.is(x, -0);
    },
    encode() {
      return undefined;
    },
    decode() {
      return -0;
    },
  },

  Infinity: {
    test(x) {
      return x === Number.POSITIVE_INFINITY;
    },
    encode() {
      return undefined;
    },
    decode() {
      return Number.POSITIVE_INFINITY;
    },
  },

  NegativeInfinity: {
    test(x) {
      return x === Number.NEGATIVE_INFINITY;
    },
    encode() {
      return undefined;
    },
    decode() {
      return Number.NEGATIVE_INFINITY;
    },
  },

  NaN: {
    test(x) {
      return Number.isNaN(x);
    },
    encode() {
      return undefined;
    },
    decode() {
      return Number.NaN;
    },
  },
} as {
  [tag: string]: {
    test: (x: any) => boolean;
    encode: (x: any) => any | undefined;
    decode: (x: any) => any | undefined;
  };
};
