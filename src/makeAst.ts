type PrimitiveValue = undefined | null | string | number | boolean;

type PrimitiveTypeValue =
    | "undefined"
    | "null"
    | "string"
    | "number"
    | "boolean";

type PlainObjectValue = {
    [key: string]: PrimitiveValue | PlainObjectValue | ArrayValue;
};

type PlainObjectTypeValue = {
    [key: string]: PrimitiveTypeValue | PlainObjectTypeValue | ArrayTypeValue;
};

type ArrayValue = Array<PrimitiveValue | PlainObjectValue | ArrayValue>;

type ArrayTypeValue = Array<
    PrimitiveTypeValue | PlainObjectTypeValue | ArrayTypeValue
>;

export type JsonDeserialized = PrimitiveValue | PlainObjectValue | ArrayValue;

type PrimitiveNode = {
    type: "primitive";
    dataType: PrimitiveTypeValue;
};

type ArrayNode = {
    type: "array";
    dataType: Array<AstNode>;
};

type ObjectNode = {
    type: "object";
    shape: { [key: string]: Array<AstNode> };
};

export type AstNode = PrimitiveNode | ArrayNode | ObjectNode;

function makeArrayNode(input: ArrayValue): ArrayNode {
    return {
        type: "array",
        dataType: mergeNodes(input.map((el) => makeTypeNode(el))),
    };
}

function makeObjectNode(input: PlainObjectValue): ObjectNode {
    return {
        type: "object",
        shape: Object.fromEntries(
            Object.entries(input).map(([key, value]) => [
                key,
                [makeTypeNode(value)],
            ])
        ),
    };
}

function makePrimitiveNode(input: PrimitiveValue): PrimitiveNode {
    return {
        type: "primitive",
        dataType:
            input === null ? "null" : (typeof input as PrimitiveTypeValue),
    };
}

function makeTypeNode(value: JsonDeserialized): AstNode {
    if (Array.isArray(value)) {
        return makeArrayNode(value);
    }

    if (value !== null && typeof value === "object")
        return makeObjectNode(value);

    return makePrimitiveNode(value);
}

function mergeNodes(typeNotations: AstNode[]): AstNode[] {
    return sortTypeNodes(
        typeNotations.reduce<AstNode[]>((prev, curr) => {
            if (prev.length === 0) return [curr];

            if (curr.type === "primitive") {
                const duplicateNodeIndex = prev.findIndex(
                    (item) =>
                        item.type === "primitive" &&
                        item.dataType === curr.dataType
                );

                if (duplicateNodeIndex === -1) return [...prev, curr];

                return prev;
            }

            if (curr.type === "array") {
                const duplicateNodeIndex = prev.findIndex(
                    (el) => el.type === "array"
                );

                if (duplicateNodeIndex === -1) return [...prev, curr];
                return [
                    ...prev.slice(0, duplicateNodeIndex),
                    ...prev.slice(duplicateNodeIndex + 1),
                    {
                        type: "array",
                        dataType: mergeNodes([
                            ...(prev[duplicateNodeIndex] as ArrayNode).dataType,
                            ...curr.dataType,
                        ]),
                    },
                ];
            }

            if (curr.type === "object") {
                const duplicateNodeIndex = prev.findIndex(
                    (el) => el.type === "object"
                );

                if (duplicateNodeIndex === -1) return [...prev, curr];

                return [
                    ...prev.slice(0, duplicateNodeIndex),
                    ...prev.slice(duplicateNodeIndex + 1),
                    mergeObjectNodes(
                        prev[duplicateNodeIndex] as ObjectNode,
                        curr
                    ),
                ];
            }

            throw new Error("Unsupported node detected");
        }, [] as AstNode[])
    );
}

function sortTypeNodes(nodes: AstNode[]): AstNode[] {
    const typeSortMap: Record<AstNode["type"], number> = {
        primitive: 1,
        array: 2,
        object: 3,
    };

    return nodes.sort((a, b) => {
        return Math.max(
            -1,
            Math.min(1, typeSortMap[a.type] - typeSortMap[b.type])
        );
    });
}

function mergeObjectNodes(o1: ObjectNode, o2: ObjectNode): ObjectNode {
    const keys = Array.from(
        new Set([...Object.keys(o1.shape), ...Object.keys(o2.shape)])
    );

    const newShape = Object.fromEntries(
        keys.map((key) => {
            const typeUnion1 = o1.shape[key];
            const typeUnion2 = o2.shape[key];

            if (typeUnion1 === undefined || typeUnion2 === undefined)
                return [
                    key,
                    mergeNodes([
                        ...(typeUnion1 === undefined ? typeUnion2 : typeUnion1),
                        makePrimitiveNode(undefined),
                    ]),
                ];

            return [key, mergeNodes([...typeUnion1, ...typeUnion2])];
        })
    );

    return { type: "object", shape: newShape };
}

export function makeAst(input: JsonDeserialized): AstNode {
    const ast = makeTypeNode(input);
    return mergeNodes([ast])[0];
}
