import { bytesToBigInt, fromHex, generateEmailVerifierInputs } from "@zk-email/helpers";
import fs from "fs";
import path from "path";

export const STRING_PRESELECTOR = "email was meant for @";
export const MAX_HEADER_PADDED_BYTES = 1024;
export const MAX_BODY_PADDED_BYTES = 1536;
export const ethereumAddress = "0x8cAb42EF3c96Ca59f5C52E687197d9e54161831A";

async function generateTwitterVerifierCircuitInputs(rawEmail: string) {
  // generate input for email verifier circuit
  const emailVerifierInputs = await generateEmailVerifierInputs(rawEmail, {
    shaPrecomputeSelector: STRING_PRESELECTOR,
  });

  // Char array to Uint8Array
  const bodyRemaining = emailVerifierInputs.emailBody!.map((c) => Number(c)); 
  const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
  const usernameIndex = Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const address = bytesToBigInt(fromHex(ethereumAddress)).toString();

  const inputJson = {
    ...emailVerifierInputs,
    twitterUsernameIndex: usernameIndex.toString(),
    address
  };
  fs.writeFileSync(path.join(__dirname, "input.json"), JSON.stringify(inputJson));
}

async function main() {
  if(fs.existsSync(path.join(__dirname, "input.json"))){
    console.log("input.json already exists. No need to generate.");
    process.exit(0);
  }
  const args = process.argv.slice(1);
  if(args.length !== 2) {
    console.error("Invalid param. Check the usage of this command");
    process.exit(1);
  }
  const emlPath = args[1];
  const rawEmail = fs.readFileSync(emlPath, "utf8");
  await generateTwitterVerifierCircuitInputs(rawEmail);
  console.log("Input file generated at ./scripts/input.json");
}

main();