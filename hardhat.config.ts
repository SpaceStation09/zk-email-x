import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  typechain: {
    outDir: "types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
  },
};
