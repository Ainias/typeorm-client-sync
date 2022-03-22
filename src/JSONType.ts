export type JSONNativeValue =
    | string
    | number
    | boolean
    | null
    | undefined


export type JSONValue =
    | JSONNativeValue
    | JSONObject
    | JSONArray;

export type JSONObject = { [x: string]: JSONValue }
export type JSONArray = Array<JSONValue>
