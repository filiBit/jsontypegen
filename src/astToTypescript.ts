import { AstNode } from "./makeAst";

export function astToTypescript(nodeList: AstNode[]): string {
    const result = nodeList.map((node) => {
        if (node.type === "primitive") return node.dataType;

        if (node.type === "array") {
            return `Array<${astToTypescript(node.dataType) || "never"}>`;
        }

        if (node.type === "object") {
            return (
                "{" +
                Object.entries(node.shape)
                    .map(
                        ([key, value]) =>
                            (value.some(
                                (el) =>
                                    el.type === "primitive" &&
                                    el.dataType === "undefined"
                            )
                                ? `"${key}"?:`
                                : `"${key}":`) +
                            astToTypescript(
                                value.filter((el) =>
                                    el.type === "primitive" &&
                                    el.dataType === "undefined"
                                        ? false
                                        : true
                                )
                            ) +
                            ";"
                    )
                    .join("") +
                "}"
            );
        }
    });

    return result.join("|");
}
