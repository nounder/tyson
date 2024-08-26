import { assert, assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { decodeObject, decodeValue } from "./decode.ts";

Deno.test("deserialize Boolean primitive", () => {
  assertEquals(
    decodeValue(true),
    true,
  );
});

Deno.test("deserialize Boolean object", () => {
  assertEquals(
    decodeValue({ $type: "BooleanObject", $: true }),
    Object(true),
  );
});

Deno.test("deserialize String primitive", () => {
  assertEquals(
    decodeValue("string"),
    "string",
  );
});

Deno.test("deserialize String object", () => {
  assertEquals(
    decodeValue({ $type: "StringObject", $: "string" }),
    Object("string"),
  );
});

Deno.test("deserialize Number primitive", () => {
  assertEquals(
    decodeValue(42),
    42,
  );
});

Deno.test("deserialize Number object", () => {
  assertEquals(
    decodeValue({ $type: "NumberObject", $: 42 }),
    Object(42),
  );
});

Deno.test("deserialize NaN", () => {
  assert(
    Number.isNaN(decodeValue({ $type: "NaN" })),
  );
});

Deno.test("deserialize Infinity", () => {
  assertEquals(
    decodeValue({ $type: "Infinity" }),
    Infinity,
  );
});

Deno.test("deserialize -Infinity", () => {
  assertEquals(
    decodeValue({ $type: "NegativeInfinity" }),
    -Infinity,
  );
});

Deno.test("deserialize -0", () => {
  assert(
    Object.is(decodeValue({ $type: "NegativeZero" }), -0),
  );
});

Deno.test("deserialize BigInt", () => {
  assertEquals(
    decodeValue({ $type: "BigInt", $: "9007199254740991" }),
    BigInt(9007199254740991),
  );
});

Deno.test("deserialize BigInt object", () => {
  assertEquals(
    decodeValue({ $type: "BigIntObject", $: "9007199254740991" }),
    Object(BigInt(9007199254740991)),
  );
});

Deno.test("deserialize Date", () => {
  const date = new Date("2023-05-20T12:00:00Z");
  assertEquals(
    decodeValue({ $type: "Date", $: date.getTime() }),
    date,
  );
});

Deno.test("deserialize Invalid Date", () => {
  assert(
    Number.isNaN(decodeValue({ $type: "Date", $: "NaN" }).getTime()),
  );
});

Deno.test("deserialize Error", () => {
  const error = new Error("Test error");
  const serialized = {
    $type: "Error",
    $: {
      name: "Error",
      message: "Test error",
      stack: error.stack,
    },
  };
  // @ts-ignore it's fine
  const deserialized = decodeValue(serialized);

  assertObjectMatch(deserialized, {
    name: "Error",
    message: "Test error",
  });

  assert(deserialized.stack !== undefined);
});

Deno.test("deserialize Set", () => {
  const set = new Set([1, 2, 3]);
  assertEquals(
    decodeValue({ $type: "Set", $: [1, 2, 3] }),
    set,
  );
});

Deno.test("deserialize RegExp", () => {
  const regex = /test/gi;
  assertEquals(
    decodeValue({
      $type: "RegExp",
      $: { source: "test", flags: "gi" },
    }),
    regex,
  );
});

Deno.test("deserialize Map", () => {
  const map = new Map([["key1", "value1"], ["key2", "value2"]]);
  assertEquals(
    decodeValue({
      $type: "Map",
      $: [["key1", "value1"], ["key2", "value2"]],
    }),
    map,
  );
});

Deno.test("deserialize undefined", () => {
  assertEquals(
    decodeValue({ $type: "Undefined" }),
    undefined,
  );
});

Deno.test("deserialize literals in object", () => {
  const value = {
    null: null,
    boolean: true,
    number: 1,
    string: "2",
  };
  const deserialized = decodeClonedObject(value);

  assertEquals(deserialized, value);
});

Deno.test("deserialize flat array in object", () => {
  const value = {
    list: [1, 2, 3],
  };
  const deserialized = decodeClonedObject(value);

  assertEquals(deserialized, value);
});

Deno.test("deserialize nested array in object", () => {
  const value = {
    list: [1, [2, 3], [4, 5, 6]],
  };
  const deserialized = decodeClonedObject(value);

  assertEquals(deserialized, value);
});

Deno.test("deserialize nested object", () => {
  const value = {
    settings: {
      theme: "dark",
      bindings: "vim",
    },
  };
  const deserialized = decodeClonedObject(value);

  assertEquals(deserialized, value);
});

Deno.test("deserialize circular object", () => {
  const joe = {
    name: "Joe",
  };
  const serialized = {
    "$defs": {
      "*1": joe,
    },
    "owner": {
      $ref: "*1",
    },
    "creator": {
      $ref: "*1",
    },
  };
  const deserialized = decodeClonedObject(serialized);

  assertEquals(deserialized.owner, joe);
  assertEquals(deserialized.owner, joe);
});

function decodeClonedObject(obj) {
  const clonedObject = structuredClone(obj);

  decodeObject(clonedObject);

  return clonedObject;
}
