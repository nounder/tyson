import { JsObject } from "./types";
import { isPlainObject } from "./utils";

export function* walkObject(src: JsObject) {
  for (const key in src) {
    const v = src[key];

    if (isPlainObject(v)) {
      yield v

      yield* walkObject(v);
    }
  }
}


