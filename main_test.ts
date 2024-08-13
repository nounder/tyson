import { assert, assertEquals, assertMatch, assertObjectMatch } from "jsr:@std/assert"
import { serializeObject, serializeValue } from "./main.ts"

Deno.test("serialize Boolean primitive", () => {
	assertEquals(
		serializeValue(true),
		true,
	)
})

Deno.test("serialize Boolean object", () => {
	assertEquals(
		serializeValue(Object(true)),
		{ $type: "BooleanObject", value: true },
	)
})

Deno.test("serialize String primitive", () => {
	assertEquals(
		serializeValue("string"),
		"string",
	)
})

Deno.test("serialize String object", () => {
	assertEquals(
		serializeValue(Object("string")),
		{ $type: "StringObject", value: "string" },
	)
})

Deno.test("serialize Number primitive", () => {
	assertEquals(
		serializeValue(42),
		42,
	)
})

Deno.test("serialize Number object", () => {
	assertEquals(
		serializeValue(Object(42)),
		{ $type: "NumberObject", value: 42 },
	)
})

Deno.test("serialize NaN", () => {
	assertEquals(
		serializeValue(NaN),
		{ $type: "NaN" },
	)
})

Deno.test("serialize Infinity", () => {
	assertEquals(
		serializeValue(Infinity),
		{ $type: "Infinity" },
	)
})

Deno.test("serialize -Infinity", () => {
	assertEquals(
		serializeValue(-Infinity),
		{ $type: "NegativeInfinity" },
	)
})

Deno.test("serialize -0", () => {
	assertEquals(
		serializeValue(-0),
		{ $type: "NegativeZero" },
	)
})

Deno.test("serialize BigInt", () => {
	assertEquals(
		serializeValue(BigInt(9007199254740991)),
		{ $type: "BigInt", value: "9007199254740991" },
	)
})

Deno.test("serialize BigInt object", () => {
	assertEquals(
		serializeValue(Object(BigInt(9007199254740991))),
		{ $type: "BigIntObject", value: "9007199254740991" },
	)
})

Deno.test("serialize Date", () => {
	const date = new Date("2023-05-20T12:00:00Z")
	assertEquals(
		serializeValue(date),
		{ $type: "Date", value: date.getTime() },
	)
})

Deno.test("serialize Invalid Date", () => {
	const invalidDate = new Date("Invalid Date")
	assertEquals(
		serializeValue(invalidDate),
		{ $type: "Date", value: "NaN" },
	)
})

Deno.test("serialize Error", () => {
	const error = new Error("Test error")
	const serialized = serializeValue(error)

	assertObjectMatch(serialized, {
		$type: "Error",
		value: {
			name: "Error",
			message: "Test error",
		},
	})

	assert(serialized.value.stack !== undefined)
})

Deno.test("serialize String object", () => {
	assertEquals(
		serializeValue(Object("test")),
		{ $type: "StringObject", value: "test" },
	)
})

Deno.test("serialize Boolean object", () => {
	assertEquals(
		serializeValue(Object(true)),
		{ $type: "BooleanObject", value: true },
	)
})

Deno.test("serialize Set", () => {
	const set = new Set([1, 2, 3])
	assertEquals(
		serializeValue(set),
		{ $type: "Set", value: [1, 2, 3] },
	)
})

Deno.test("serialize RegExp", () => {
	const regex = /test/gi
	assertEquals(
		serializeValue(regex),
		{ $type: "RegExp", value: { source: "test", flags: "gi" } },
	)
})

Deno.test("serialize Map", () => {
	const map = new Map([["key1", "value1"], ["key2", "value2"]])
	assertEquals(
		serializeValue(map),
		{ $type: "Map", value: [["key1", "value1"], ["key2", "value2"]] },
	)
})

Deno.test("serialize undefined", () => {
	assertEquals(
		serializeValue(undefined),
		{ $type: "Undefined" },
	)
})

Deno.test("serialize literals in object", () => {
	const value = {
		null: null,
		boolean: true,
		number: 1,
		string: "2",
	}
	const serialized = serializeObject(value)

	assertEquals(serialized, value)
})

Deno.test("serialize flat array in object", () => {
	const value = {
		list: [1, 2, 3],
	}
	const serialized = serializeObject(value)

	assertEquals(serialized, value)
})

Deno.test("serialize nested array in object", () => {
	const value = {
		list: [1, [2, 3], [4, 5, 6]],
	}
	const serialized = serializeObject(value)

	assertEquals(serialized, value)
})

Deno.test("serialize nested object", () => {
	const value = {
		settings: {
			theme: "dark",
			bindings: "vim",
		},
	}
	const serialized = serializeObject(value)

	assertEquals(serialized, value)
})

Deno.test("serialize circular object", () => {
	const joe = {
		name: "Joe",
	}
	const value = {
		owner: joe,
		creator: joe,
	}
	const serialized = serializeObject(value)

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
	})
})
