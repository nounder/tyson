import Types from "./types.ts";
import { isPlainObject } from "./utils.ts";

type JSObject = Record<string, any>;

export function decodeValue(value) {
  if ("$type" in value) {
    const typeSpec = Types[value.$type];

    if (typeSpec) {
      const decodedValue = typeSpec.revive(value);

      if (decodedValue !== undefined) {
        return decodedValue;
      }
    } else {
      throw new Error(`Unknown type: ${value.$type}`);
    }
  }

  return value;
}

function derefObject(
  target: JSObject,
  defs: Record<string, JSObject>,
) {
  for (const [k, v] of Object.entries(target)) {
    if (isPlainObject(v)) {
      const { $ref } = v;

      if ($ref !== undefined) {
        const refObj = defs[$ref];

        if (!refObj) {
          throw new Error(`Reference not found: ${$ref}`);
        }

        target[k] = refObj;
      } else {
        derefObject(v, defs);
      }
    }
  }

  return defs;
}

export function decodeObject(target: object) {
  if ("$defs" in target) {
    const { $defs } = target;

    // TODO: Handle circular refs
    // TODO: Throw on missing refs
    // TODO: Throw on missing refs
  }
}
