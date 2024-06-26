import { BigNumberish } from "ethers";

export const twitterDKIMPubkeyHash1 =
  "0x20f1a7b899cd96e1cb783b1d141c2c6cc1ca55260aee5364b489fbbb8c39f5bf";
export const twitterDKIMPubkeyHash2 =
  "0x0462b6e208f3552371d7c7d2fbeb31691e5f789b9e5f0bdfaa68a6a84f01d9aa";

// export const generatedProof = [
//   "0x0fd9ec8ba22c3be7653ec13744db53b913c8036158a0b586acef5019a01602bc",
//   "0x0130b9e1926ab3d2931cc3f7f106c66c7c2d88cea3b232ebbfb0eab882016d01",
//   "0x08f1127b66eace8393f04eedb83dbda4f66cbb19a5fe83f38fe343aced964785",
//   "0x03bbd3917831a1e20c417344b03326ed9ebbd3d2ec4a0d6a3fa92d314bfedb96",
//   "0x135cc94afeca0a28c5644123fc67638798f6c90ab371c4708ac69f4f9077b569",
//   "0x0aeb3cc3e1d277542d9f68e9bc022fff945bbe84cfb53276748aad96efee32a9",
//   "0x13876fa93c1b78b55313cab339c8dc94e4afb164132d80f3a3c04714b3dbdbcd",
//   "0x24ccd9c2b315190873feff770f4bdd5af7da9d0ddea935368170e99bf18c9b48",
// ];

export const generatedSignal: Signal = [
  "0x0462b6e208f3552371d7c7d2fbeb31691e5f789b9e5f0bdfaa68a6a84f01d9aa",
  "0x000000000000000000000000000000000039306e6f69746174735f6563617073",
  "0x0000000000000000000000000071c7656ec7ab88b098defb751b7401b5f6d897",
];

export type Signal = [BigNumberish, BigNumberish, BigNumberish];