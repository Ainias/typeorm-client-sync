export declare type JSONNativeValue = string | number | boolean | null | undefined;
export declare type JSONValue = JSONNativeValue | JSONObject | JSONArray;
export declare type JSONObject = {
    [x: string]: JSONValue;
};
export declare type JSONArray = Array<JSONValue>;
