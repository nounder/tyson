import { assert, assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { encodeObject, encodeValue } from "./encode.ts";

Deno.test("serialize Boolean primitive", () => {
  assertEquals(
    encodeValue(true),
    true,
  );
});

Deno.test("serialize Boolean object", () => {
  assertEquals(
    encodeValue(Object(true)),
    { $type: "BooleanObject", value: true },
  );
});

Deno.test("serialize String primitive", () => {
  assertEquals(
    encodeValue("string"),
    "string",
  );
});

Deno.test("serialize String object", () => {
  assertEquals(
    encodeValue(Object("string")),
    { $type: "StringObject", value: "string" },
  );
});

Deno.test("serialize Number primitive", () => {
  assertEquals(
    encodeValue(42),
    42,
  );
});

Deno.test("serialize Number object", () => {
  assertEquals(
    encodeValue(Object(42)),
    { $type: "NumberObject", value: 42 },
  );
});

Deno.test("serialize NaN", () => {
  assertEquals(
    encodeValue(NaN),
    { $type: "NaN" },
  );
});

Deno.test("serialize Infinity", () => {
  assertEquals(
    encodeValue(Infinity),
    { $type: "Infinity" },
  );
});

Deno.test("serialize -Infinity", () => {
  assertEquals(
    encodeValue(-Infinity),
    { $type: "NegativeInfinity" },
  );
});

Deno.test("serialize -0", () => {
  assertEquals(
    encodeValue(-0),
    { $type: "NegativeZero" },
  );
});

Deno.test("serialize BigInt", () => {
  assertEquals(
    encodeValue(BigInt(9007199254740991)),
    { $type: "BigInt", value: "9007199254740991" },
  );
});

Deno.test("serialize BigInt object", () => {
  assertEquals(
    encodeValue(Object(BigInt(9007199254740991))),
    { $type: "BigIntObject", value: "9007199254740991" },
  );
});

Deno.test("serialize Date", () => {
  const date = new Date("2023-05-20T12:00:00Z");
  assertEquals(
    encodeValue(date),
    { $type: "Date", value: date.getTime() },
  );
});

Deno.test("serialize Invalid Date", () => {
  const invalidDate = new Date("Invalid Date");
  assertEquals(
    encodeValue(invalidDate),
    { $type: "Date", value: "NaN" },
  );
});

Deno.test("serialize Error", () => {
  const error = new Error("Test error");
  const serialized = encodeValue(error);

  assertObjectMatch(serialized, {
    $type: "Error",
    value: {
      name: "Error",
      message: "Test error",
    },
  });

  assert(serialized.value.stack !== undefined);
});

Deno.test("serialize String object", () => {
  assertEquals(
    encodeValue(Object("test")),
    { $type: "StringObject", value: "test" },
  );
});

Deno.test("serialize Boolean object", () => {
  assertEquals(
    encodeValue(Object(true)),
    { $type: "BooleanObject", value: true },
  );
});

Deno.test("serialize Set", () => {
  const set = new Set([1, 2, 3]);
  assertEquals(
    encodeValue(set),
    { $type: "Set", value: [1, 2, 3] },
  );
});

Deno.test("serialize RegExp", () => {
  const regex = /test/gi;
  assertEquals(
    encodeValue(regex),
    { $type: "RegExp", value: { source: "test", flags: "gi" } },
  );
});

Deno.test("serialize Map", () => {
  const map = new Map([["key1", "value1"], ["key2", "value2"]]);
  assertEquals(
    encodeValue(map),
    { $type: "Map", value: [["key1", "value1"], ["key2", "value2"]] },
  );
});

Deno.test("serialize undefined", () => {
  assertEquals(
    encodeValue(undefined),
    { $type: "Undefined" },
  );
});

Deno.test("serialize literals in object", () => {
  const value = {
    null: null,
    boolean: true,
    number: 1,
    string: "2",
  };
  const serialized = encodeObject(value);

  assertEquals(serialized, value);
});

Deno.test("serialize flat array in object", () => {
  const value = {
    list: [1, 2, 3],
  };
  const serialized = encodeObject(value);

  assertEquals(serialized, value);
});

Deno.test("serialize nested array in object", () => {
  const value = {
    list: [1, [2, 3], [4, 5, 6]],
  };
  const serialized = encodeObject(value);

  assertEquals(serialized, value);
});

Deno.test("serialize nested object", () => {
  const value = {
    settings: {
      theme: "dark",
      bindings: "vim",
    },
  };
  const serialized = encodeObject(value);

  assertEquals(serialized, value);
});

Deno.test("serialize circular object", () => {
  const joe = {
    name: "Joe",
  };
  const value = {
    owner: joe,
    creator: joe,
  };
  const serialized = encodeObject(value);

  assertEquals(serialized, {
    "$defs": {
      "*1": joe,
    },
    "owner": {
      $ref: "*1",
    },
    "creator": {
      $ref: "*1",
    },
  });
});
