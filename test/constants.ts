import { BigNumberish } from "ethers";

export const twitterDKIMPubkeyHash1 =
  "0x20f1a7b899cd96e1cb783b1d141c2c6cc1ca55260aee5364b489fbbb8c39f5bf";
export const twitterDKIMPubkeyHash2 =
  "0x0462b6e208f3552371d7c7d2fbeb31691e5f789b9e5f0bdfaa68a6a84f01d9aa";

export const generatedSignal: Signal = [
  "0x0462b6e208f3552371d7c7d2fbeb31691e5f789b9e5f0bdfaa68a6a84f01d9aa",
  "0x000000000000000000000000000000000039306e6f69746174735f6563617073",
  "0x0000000000000000000000008cab42ef3c96ca59f5c52e687197d9e54161831a",
];

export type Signal = [BigNumberish, BigNumberish, BigNumberish];