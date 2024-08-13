import Types from "./types.ts"
import { isPlainObject, isPrimitive, toJSONType, toStringTag } from "./utils.ts"

type JSON = Primitive | Primitive[] | { [key: string]: JSON }
type Primitive = null | boolean | number | string

type JSObject = Record<string, any>

type ObjectIds = WeakMap<object, string | null>

const wrapValue = (value: any) => {
	const jsonType = toJSONType(value)

	if (jsonType) {
		return value
	}

	for (const [tag, spec] of Object.entries(Types)) {
		if (spec.test(value)) {
			const replacedValue = spec.replace(value)

			if (replacedValue) {
				return {
					$type: tag,
					value: replacedValue,
				}
			} else {
				return {
					$type: tag,
				}
			}
		}
	}

	throw new Error(`Cannot serialize value: ${value}`)
}

const scanObject = (src: JSObject, objectIds?: ObjectIds) => {
	if (!objectIds) {
		objectIds = new WeakMap()
	}
	const objectId = objectIds.get(src)
	let refCount = 0

	if (objectId) {
		return
	} else if (objectId === undefined) {
		objectIds.set(src, null)
	} else if (objectId === null) {
		objectIds.set(src, "*" + (++refCount))

		return
	}

	for (const v of Object.values(src)) {
		if (isPlainObject(v)) {
			scanObject(v, objectIds)
		}
	}

	return objectIds
}

const refObject = (src: JSObject, dst: JSObject, objectIds?: ObjectIds) => {
	const defs = {} as Record<string, JSObject>

	for (const [k, v] of Object.entries(src)) {
		if (isPlainObject(v)) {
			const objectId = objectIds?.get(v)

			if (objectId) {
				if (!defs[objectId]) {
					defs[objectId] = v
				}

				dst[k] = { $ref: objectId }

				refObject(v, defs[objectId], objectIds)
			} else {
				dst[k] = {}

				refObject(v, dst[k], objectIds)
			}
		} else {
			dst[k] = wrapValue(v)
		}
	}

	return defs
}

export const serializeObject = (source: object) => {
	const dstRoot = {}

	const objectIds = scanObject(source)
	const defs = refObject(source, dstRoot, objectIds)

	dstRoot["$defs"] = defs

	return dstRoot
}

if (import.meta.main) {
	const repeated = { _: "repeated" }
	const nested = { repeated }
	repeated["nested"] = nested
	const ser = serializeObject({
		oops: null,
		repeated,
		big: 100n,
		bigobj: Object(BigInt(23)),
		// settings: {
		// 	theme: "dark",
		// 	repeated,
		// },
		test: undefined,
	})

	console.log(ser)
}

const obj = {
	$defs: {
		"Frame:1": {
			$id: "Frame:1",
			image_url: "",
			buttons: [{ $ref: "FrameButton:1" }],
		},
		"FrameButton:1": {
			$id: "FrameButton:1",
			type: "Goto",
			text: "Add to cart",
		},
		"FrameButton:2": {
			$id: "FrameButton:2",
			text: "Read more",
			target: {
				url: "http://example.com",
			},
		},
	},

	list: [
		{
			blocks: [{ $ref: "Frame:1" }],
		},
		{
			blocks: [
				{
					$ref: "Frame:1",
				},
				{
					$ref: "FrameId:32132",
				},
			],
		},
	],
}
