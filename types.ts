import { toStringTag } from "./utils.ts";

export default {
  Undefined: {
    test(x) {
      return x === undefined;
    },
    replace: () => null,
    revive: () => null,
  },

  BigInt: {
    test(x) {
      return typeof x === "bigint";
    },
    replace: String,
    revive(s: string) {
      return BigInt(s);
    },
  },

  Date: {
    test(x) {
      return toStringTag(x) === "Date";
    },
    replace(dt) {
      const time = dt.getTime();
      if (Number.isNaN(time)) {
        return "NaN";
      }
      return time;
    },
    revive(time) {
      if (time === "NaN") {
        return new Date(Number.NaN);
      }
      return new Date(time);
    },
  },

  Error: {
    test(x) {
      return toStringTag(x) === "Error";
    },
    replace({
      name,
      message,
      cause,
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
    revive(s) {
      return new Object(BigInt(/** @type {string} */ (s)));
    },
  },

  // String Object (not primitive string which need no type spec)
  StringObject: {
    test(x) {
      return toStringTag(x) === "String" && typeof x === "object";
    },
    replace: String,
    revive(s) {
      return new String(s);
    }, // Revive to an objectified string
  },

  // Boolean Object (not primitive boolean which need no type spec)
  BooleanObject: {
    test(x) {
      return toStringTag(x) === "Boolean" &&
        typeof x === "object";
    },
    replace: Boolean,
    revive(b) {
      // Revive to an objectified Boolean
      return new Boolean(b);
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

  Set: {
    test(x) {
      return toStringTag(x) === "Set";
    },
    replace(st) {
      return [...st.values()];
    },
    revive(values) {
      return new Set(values);
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
    replace(/* n */) {
      // Just adding 0 here for minimized space; will still revive as -0
      return null;
    },
    revive(/* s */) {
      return -0;
    },
  },

  Infinity: {
    test(x) {
      return x === Number.POSITIVE_INFINITY;
    },
    replace(/* n */) {
      return null;
    },
    revive(/* s */) {
      return Number.POSITIVE_INFINITY;
    },
  },

  NegativeInfinity: {
    test(x) {
      return x === Number.NEGATIVE_INFINITY;
    },
    replace(/* n */) {
      return null;
    },
    revive(/* s */) {
      return Number.NEGATIVE_INFINITY;
    },
  },

  NaN: {
    test(x) {
      return Number.isNaN(x);
    },
    replace(/* n */) {
      return null;
    },
    revive(/* s */) {
      return Number.NaN;
    },
  },

  Map: {
    test(x) {
      return toStringTag(x) === "Map";
    },
    replace(mp) {
      return [...mp.entries()];
    },
    revive(entries) {
      return new Map(entries);
    },
  },
};
