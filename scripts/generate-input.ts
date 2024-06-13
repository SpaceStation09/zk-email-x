import { bytesToBigInt, fromHex, generateEmailVerifierInputs } from "@zk-email/helpers";
import fs from "fs";
import path from "path";

export const STRING_PRESELECTOR = "email was meant for @";
export const MAX_HEADER_PADDED_BYTES = 1024;
export const MAX_BODY_PADDED_BYTES = 1536;
export const ethereumAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d897";

async function generateTwitterVerifierCircuitInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "..", "emls", "twitter.eml"),
    "utf8"
  );

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

generateTwitterVerifierCircuitInputs();