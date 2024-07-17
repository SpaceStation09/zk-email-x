import fs from "fs";
import path from "path";
import PublicJSON from "../proof/public.json";
import ProofJSON from "../proof/proof.json";

const snarkjs = require("snarkjs");
const OUTPUT_PATH = path.resolve(__dirname, "contract-calldata.json");

async function main() {
  const rawCalldataStr = await snarkjs.groth16.exportSolidityCallData(ProofJSON, PublicJSON);
  const removeBrackets = rawCalldataStr.replaceAll(/\[|]|\"/g, "");
  const calldataArr: string[] = removeBrackets.split(",").map((x) => x.trim());
  const proofA = [calldataArr[0], calldataArr[1]];
  const proofB = [
    [calldataArr[2], calldataArr[3]],
    [calldataArr[4], calldataArr[5]],
  ];
  const proofC = [calldataArr[6], calldataArr[7]];

  const calldataJSON = {
    _pA: proofA,
    _pb: proofB,
    _pc: proofC,
    _pubSignals: calldataArr.slice(-3),
  };
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(calldataJSON));
}
main()