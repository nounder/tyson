import Types from "./types.ts";
import { isPlainObject } from "./utils.ts";

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

type RefObject = { ["$ref"]: string };
type TypedObject = { ["$type"]: string; ["$?"]: JsonValue };

type EncodedJsonObject =
  | JsonObject
  | TypedObject
  | RefObject;

// cannot have ref
type EncodedDefinition =
  | JsonObject
  | (JsonObject & TypedObject);

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
      const decodedValue = typeSpec.decode(value["$"]);

      return decodedValue;
    } else {
      throw new Error(`Unknown type: ${value.$type}`);
    }
  }

  return value;
}

export function decodeObject(target: EncodedDocument): void {
  const { $defs, ...rest } = target;

  // First we have to deref defs
  if ($defs) {
    derefDefs(target.$defs as EncodedDefinitionMap);
  }

  derefObject(rest, (target.$defs as EncodedDefinitionMap) || {});

  Object.assign(target, rest);
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
  for (const k in target) {
    const v = target[k];

    if (isPlainObject(v)) {
      const $ref = v["$ref"] as string;

      if ($ref !== undefined) {
        const refObj = defs[$ref];

        if (!refObj) {
          throw new Error(`Reference not found: ${$ref}`);
        }

        target[k] = refObj;
      } else {
        // @ts-ignore all good. object is plain
        derefObject(v, defs);
      }
    }
  }
}
