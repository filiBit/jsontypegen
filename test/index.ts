import { jsonToTypescript } from "../src";
import input1 from "./fixtures/input-1.json";
import input2 from "./fixtures/input-2.json";
import output1 from "./fixtures/output-1";
import output2 from "./fixtures/output-2";

if (jsonToTypescript(input1) === output1) {
    console.log("input1 parsed successfully");
} else throw new Error("input1 did not parse correctly");

if (jsonToTypescript(input2) === output2)
    console.log("input2 parsed successfully");
else throw new Error("input2 did not parse correctly");
