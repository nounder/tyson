const randomString = (length = 12) =>
	[...crypto.getRandomValues(new Uint8Array(length))]
		.map((x) => (x % 36).toString(36))
		.join("")

type Obj = Record<string, any>

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
	const defs = {} as Record<string, Obj>
	let refCount = 0

	const scanObject = (src: Obj) => {
		const objectId = objectIds.get(src)

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
				scanObject(v)
			}
		}
	}

	const mapObject = (src: Obj, dst: Obj) => {
		for (const [k, v] of Object.entries(src)) {
			if (isPlainObject(v)) {
				const objectId = objectIds.get(v)

				if (objectId) {
					if (!defs[objectId]) {
						defs[objectId] = v
					}

					dst[k] = { $ref: objectId }

					mapObject(v, defs[objectId])
				} else {
					dst[k] = {}

					mapObject(v, dst[k])
				}
			} else {
				dst[k] = serializeValue(v)
			}
		}
	}

	scanObject(source)

	mapObject(source, dstRoot)

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
