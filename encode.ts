import Types from "./types.ts";
import { isPlainObject, toJSONType } from "./utils.ts";

type Json = JsonPrimitive | JsonPrimitive[] | { [key: string]: Json };
type JsonPrimitive = null | boolean | number | string;

type JSObject = Record<string, any>;

type ObjectIds = WeakMap<object, string | null>;

/**
 * Walk through the object and assign a unique identifier to each object
 * if it's referenced more than once. Used to detect circular references.
 */
function identifyCircularObjects(src: JSObject, objectIds?: ObjectIds) {
  if (!objectIds) {
    objectIds = new WeakMap();
  }
  const objectId = objectIds.get(src);
  let refCount = 0;

  if (objectId) {
    return;
  } else if (objectId === undefined) {
    objectIds.set(src, null);
  } else if (objectId === null) {
    objectIds.set(src, "*" + (++refCount));

    return;
  }

  for (const v of Object.values(src)) {
    if (isPlainObject(v)) {
      identifyCircularObjects(v, objectIds);
    }
  }

  return objectIds;
}

/**
 * Replace objects with references to their unique identifiers.
 * Returns a id -> object mapping of all circular objects found in `objectIds`
 */
function refObject(src: JSObject, dst: JSObject, objectIds?: ObjectIds) {
  const defs = {} as Record<string, JSObject>;

  for (const [k, v] of Object.entries(src)) {
    if (isPlainObject(v)) {
      const objectId = objectIds?.get(v);

      if (objectId) {
        if (!defs[objectId]) {
          defs[objectId] = v;
        }

        dst[k] = { $ref: objectId };

        refObject(v, defs[objectId], objectIds);
      } else {
        dst[k] = {};

        refObject(v, dst[k], objectIds);
      }
    } else {
      dst[k] = encodeValue(v);
    }
  }

  return defs;
}

export function encodeValue(value: any) {
  const jsonType = toJSONType(value);

  if (jsonType) {
    return value;
  }

  for (const [tag, spec] of Object.entries(Types)) {
    if (spec.test(value)) {
      const replacedValue = spec.encode(value);

      if (replacedValue === undefined) {
        return {
          $type: tag,
        };
      }

      return {
        $type: tag,
        value: replacedValue,
      };
    }
  }

  throw new Error(`Cannot serialize value: ${value}`);
}

export function encodeObject(source: object) {
  const dstRoot = {};

  const objectIds = identifyCircularObjects(source);
  const defs = refObject(source, dstRoot, objectIds);

  if (Object.keys(defs).length > 0) {
    dstRoot["$defs"] = defs;
  }

  return dstRoot;
}
