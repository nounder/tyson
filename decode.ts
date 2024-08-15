import Types from "./types.ts";
import { isPlainObject } from "./utils.ts";

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | JsonPrimitive[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

type RefObject = { $ref: string };
type TypedObject = { $type: string };

type EncodedJsonObject =
  | JsonObject
  | TypedObject
  | RefObject;

// cannot have ref
type EncodedDefinition =
  | JsonObject
  | (JsonObject & { $type: string });

type EncodedDefinitionMap = Record<string, EncodedDefinition>;

// root object that may contain definitions
type EncodedDocument =
  | JsonObject
  | (JsonObject & { $defs: EncodedDefinitionMap });

export function decodeValue(value: EncodedJsonObject) {
  if (
    typeof value === "object" &&
    value !== null &&
    "$type" in value
  ) {
    const typeSpec = Types[value.$type as string];

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
  target: EncodedJsonObject,
  defs: EncodedDefinitionMap,
) {
  for (const [k, v] of Object.entries(target)) {
    if (isPlainObject(v)) {
      const $ref = v["$ref"] as string;

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
