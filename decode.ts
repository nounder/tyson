import Types from "./types.ts";
import { isPlainObject } from "./utils.ts";

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

type RefObject = { $ref: string };
type TypedObject = { $type: string };

// JS types without functions and symbols
type DecodableJsValue =
  | undefined
  | boolean
  | number
  | bigint
  | string
  | null
  | { [key: string]: DecodableJsValue };

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

export function decodeValue(
  value: JsonValue | EncodedJsonObject,
): any {
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

export function decodeObject(target: EncodedDocument): void {
  // First we have to deref defs
  if (target.$defs) {
    derefDefs(target.$defs as EncodedDefinitionMap);
  }

  for (const key in target) {
    if (key === "$defs") {
      continue;
    }

    const value = target[key];

    if (isPlainObject(value)) {
      derefObject(value, (target.$defs as EncodedDefinitionMap) || {});
    }
  }
}

function derefDefs(defs: EncodedJsonObject): void {
  const stuntDefs = Object.fromEntries(
    Object.keys(defs).map((k) => [k, {}]),
  );

  // Deref definitions so they point to stunts
  // we're going to shape later
  derefObject(defs, stuntDefs);

  // Now that we have all refs deref'd into stunt refs,
  // let's shape them into actual refs :')
  Object.entries(stuntDefs).forEach(([k, v]) => {
    Object.assign(v, defs[k]);
  });
}

function derefObject(
  target: EncodedJsonObject,
  defs: EncodedDefinitionMap,
): void {
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
}
