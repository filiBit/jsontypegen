# @fibiorg/jsontypegen

`@fibiorg/jsontypegen` generates a Typescript type from a provided JSON input.

Check the [Demo](https://filibit.dev/jsontypegen).

## Install

`npm install @fibiorg/jsontypegen`

## Usage

```js
import { jsonToTypescript } from "@fibiorg/jsontypegen";

console.log(
    jsonToTypescript([
        { name: "Scarlet", age: 26, education: "university", friends: 3 },
        { name: "John", age: 30, friends: ["Anna", "Jackie"] },
    ])
    // Array<{"name":string;"age":number;"education"?:string;"friends":number|Array<string>;}>
);
```

### Format with prettier

`npm install prettier`

#### In node:

```js
import { format } from "prettier";

console.log(
    format(
        `Array<{"name":string;"age":number;"education"?:string;"friends":number|Array<string>;}>`,
        {
            parser: "typescript",
            tabWidth: 4,
            printWidth: 80,
        }
    )
);
```

### In browser

In a browser environment, Prettier doesn't come with necessary plugins so we need to provide ones.

```js
import * as prettier from "prettier";
import typescriptParser from "prettier/plugins/typescript";
import estreeParser from "prettier/plugins/estree";

format(
    `Array<{"name":string;"age":number;"education"?:string;"friends":number|Array<string>;}>`,
    {
        parser: "typescript",
        plugins: [typescriptParser, estreeParser],
        tabWidth: 4,
        printWidth: 80,
    }
);
```
