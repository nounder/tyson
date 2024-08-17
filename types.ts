import { toStringTag } from "./utils.ts";

export default {
  Undefined: {
    test(x) {
      return x === undefined;
    },
    replace: () => undefined,
    revive: () => undefined,
  },

  BigInt: {
    test(x) {
      return typeof x === "bigint";
    },
    replace: String,
    revive: BigInt,
  },

  Date: {
    test(x) {
      return toStringTag(x) === "Date";
    },
    replace(x) {
      const time = x.getTime();

      if (Number.isNaN(time)) {
        return "NaN";
      }

      return time;
    },
    revive(x) {
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
    replace(x) {
      return {
        name: x.name,
        message: x.message,
        stack: x.stack,
      };
    },
    revive(x) {
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
    replace: String,
    revive(x) {
      return new Object(BigInt(x));
    },
  },

  StringObject: {
    test(x) {
      return toStringTag(x) === "String" && typeof x === "object";
    },
    replace: String,
    revive(x) {
      return new String(x);
    },
  },

  BooleanObject: {
    test(x) {
      return toStringTag(x) === "Boolean" &&
        typeof x === "object";
    },
    replace: Boolean,
    revive(x) {
      return new Boolean(x);
    },
  },

  NumberObject: {
    test(x) {
      return toStringTag(x) === "Number" && typeof x === "object";
    },
    replace: Number,
    revive(n) {
      return new Number(n);
    },
  },

  Map: {
    test(x) {
      return toStringTag(x) === "Map";
    },
    replace(x) {
      return [...x.entries()];
    },
    revive(x) {
      return new Map(x);
    },
  },

  Set: {
    test(x) {
      return toStringTag(x) === "Set";
    },
    replace(x) {
      return [...x.values()];
    },
    revive(x) {
      return new Set(x);
    },
  },

  RegExp: {
    test(x) {
      return toStringTag(x) === "RegExp";
    },

    replace(rexp) {
      return {
        source: rexp.source,
        flags: (rexp.global ? "g" : "") +
          (rexp.ignoreCase ? "i" : "") +
          (rexp.multiline ? "m" : "") +
          (rexp.sticky ? "y" : "") +
          (rexp.unicode ? "u" : ""),
      };
    },

    revive(x) {
      return new RegExp(x.source, x.flags);
    },
  },

  NegativeZero: {
    test(x) {
      return Object.is(x, -0);
    },
    replace() {
      return undefined;
    },
    revive() {
      return -0;
    },
  },

  Infinity: {
    test(x) {
      return x === Number.POSITIVE_INFINITY;
    },
    replace() {
      return undefined;
    },
    revive() {
      return Number.POSITIVE_INFINITY;
    },
  },

  NegativeInfinity: {
    test(x) {
      return x === Number.NEGATIVE_INFINITY;
    },
    replace() {
      return undefined;
    },
    revive() {
      return Number.NEGATIVE_INFINITY;
    },
  },

  NaN: {
    test(x) {
      return Number.isNaN(x);
    },
    replace() {
      return undefined;
    },
    revive() {
      return Number.NaN;
    },
  },
} as {
  [tag: string]: {
    test: (x: any) => boolean;
    replace: (x: any) => any | undefined;
    revive: (x: any) => any | undefined;
  };
};
