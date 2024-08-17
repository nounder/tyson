export type JsonPrimitive = null | boolean | number | string;

export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

type RefObject = { ["$ref"]: string };
type TypedObject = { ["$type"]: string; ["$?"]: JsonValue };

export type JsObject = Record<string, any>;

export type EncodedJsonObject =
  | JsonObject
  | TypedObject
  | RefObject;

// cannot have ref
type EncodedDefinition =
  | JsonObject
  | (JsonObject & TypedObject);

export type EncodedDefinitionMap = Record<string, EncodedDefinition>;

// root object that may contain definitions
export type EncodedDocument =
  | JsonObject
  | (JsonObject & { $defs: EncodedDefinitionMap });
