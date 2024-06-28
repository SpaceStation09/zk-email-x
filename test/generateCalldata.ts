import path from "path";
import InputJSON from "../scripts/input.json";
import { BigNumberish } from "ethers";

const snarkjs = require("snarkjs");
const WASM_PATH = path.resolve(
  __dirname,
  "..",
  "build",
  "twitter_js",
  "twitter.wasm"
);

const ZKEY_PATH = path.resolve(__dirname, "..", "proof", "twitter_final.zkey");

export const generateCalldata = async () : Promise<BigNumberish[]> => {
  const { proof } = await snarkjs.groth16.fullProve(
    InputJSON,
    WASM_PATH,
    ZKEY_PATH
  );

  const proofA = [proof.pi_a[0], proof.pi_a[1]];
  const proofB = [
    [proof.pi_b[0][1], proof.pi_b[0][0]],
    [proof.pi_b[1][1], proof.pi_b[1][0]],
  ];
  const proofC = [proof.pi_c[0], proof.pi_c[1]];
  
  const generatedProof: BigNumberish[] = proofA.concat(proofB.flat()).concat(proofC);
  return generatedProof;
}
