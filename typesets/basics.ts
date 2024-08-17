import { toStringTag } from "../utils.ts";

export const Undefined = {
  test(x) {
    return x === undefined;
  },
  encode: () => undefined,
  decode: () => undefined,
};

export const BigInt = {
  test(x) {
    return typeof x === "bigint";
  },
  encode: String,
  decode: globalThis.BigInt,
};

export const Date = {
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
      return new globalThis.Date(Number.NaN);
    }
    return new globalThis.Date(x);
  },
};

export const Map = {
  test(x) {
    return toStringTag(x) === "Map";
  },
  encode(x) {
    return [...x.entries()];
  },
  decode(x) {
    return new globalThis.Map(x);
  },
};

export const Set = {
  test(x) {
    return toStringTag(x) === "Set";
  },
  encode(x) {
    return [...x.values()];
  },
  decode(x) {
    return new globalThis.Set(x);
  },
};

export const RegExp = {
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
    return new globalThis.RegExp(x.source, x.flags);
  },
};

export const Error = {
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
    const e = new globalThis.Error(x.message);
    e.name = x.name;
    e.stack = x.stack;

    return e;
  },
};
