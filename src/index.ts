import { makeAst, type JsonDeserialized } from "./makeAst";
import { astToTypescript } from "./astToTypescript";

export function jsonToTypescript(json: string | JsonDeserialized): string {
    const validJson: JsonDeserialized =
        typeof json === "string" ? JSON.parse(json) : json;

    return "type X = " + astToTypescript([makeAst(validJson)]);
}
