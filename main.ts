const randomString = (length = 12) =>
	[...crypto.getRandomValues(new Uint8Array(length))]
		.map((x) => (x % 36).toString(36))
		.join("")

type Obj = Record<string, any>

const Source = Symbol("Source")

const isPlainObject = (x: any) => typeof x === "object" && x !== null && !Array.isArray(x)

const serializeValue = (value: any) => {
	const t = typeof value

	if (t === "undefined") {
		return {
			$type: "undefined",
		}
	} else {
		return value
	}
}

const serializeObject = (source: object) => {
	const dstRoot = {}
	const objectIds = new Map<object, string | null>()
	const wrappedRefs = new Set<{ [Source]: object }>()
	let refCount = 0

	const traverseObject = (src: Obj, dst: Obj) => {
		const objectId = objectIds.get(src)

		if (objectId) {
			return
		} else if (objectId === undefined) {
			objectIds.set(src, null)
		} else if (objectId === null) {
			objectIds.set(src, "*" + (++refCount))

			return
		}

		for (const [k, v] of Object.entries(src)) {
			if (isPlainObject(v)) {
				const wrappedRef = { [Source]: v }

				dst[k] = wrappedRef

				wrappedRefs.add(wrappedRef)

				traverseObject(v, wrappedRef)
			}
		}
	}

	traverseObject(source, dstRoot)

	const defs = {} as Record<string, { [Source]: object }>

	for (const wrappedRef of wrappedRefs) {
		const source = wrappedRef[Source]
		const {
			[Source]: _,
			...plainProperties
		} = wrappedRef
		const objectId = objectIds.get(source)

		if (objectId) {
			if (!defs[objectId]) {
				defs[objectId] = plainProperties
			}

			wrappedRef.$ref = objectId
		}

		delete wrappedRef[Source]
	}

	dstRoot["$defs"] = defs

	return dstRoot
}

if (import.meta.main) {
	const repeated = { _: "repeated" }
	const nested = { repeated }
	repeated.nested = nested
	const ser = serializeObject({
		repeated,
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
