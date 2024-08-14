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
    replace({
      name,
      message,
      stack,
    }) {
      return {
        name,
        message,
        stack,
      };
    },
    revive(obj) {
      const e = new Error(obj.message);
      e.name = obj.name;
      e.stack = obj.stack;

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
      return new Object(BigInt(/** @type {string} */ (x)));
    },
  },

  // String Object (not primitive string which need no type spec)
  StringObject: {
    test(x) {
      return toStringTag(x) === "String" && typeof x === "object";
    },
    replace: String,
    revive(x) {
      return new String(x);
    }, // Revive to an objectified string
  },

  // Boolean Object (not primitive boolean which need no type spec)
  BooleanObject: {
    test(x) {
      return toStringTag(x) === "Boolean" &&
        typeof x === "object";
    },
    replace: Boolean,
    revive(x) {
      // Revive to an objectified Boolean
      return new Boolean(x);
    },
  },

  // Number Object (not primitive number which need no type spec)
  NumberObject: {
    test(x) {
      return toStringTag(x) === "Number" && typeof x === "object";
    },
    replace: Number,
    revive(n) {
      return new Number(n);
    }, // Revive to an objectified number
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

    revive({ source, flags }) {
      return new RegExp(source, flags);
    },
  },

  NegativeZero: {
    test(x) {
      return Object.is(x, -0);
    },
    replace() {
      // Just adding 0 here for minimized space; will still revive as -0
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
