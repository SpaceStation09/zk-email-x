# zk-email-starter (WIP)

This is a starter project to implement proof of twitter with zk-email. This repo is still under construction.

## Usage

### Prerequisite

Make sure you have `snarkjs`, `rust` and `circom` installed.

### Install

Clone the repo and install all dependencies.

```
  yarn
```

### Circuits

#### zk-regex

Build your twitter email regex circuit:

  Use [zk-regex](https://github.com/zkemail/zk-regex) to help generate [twitter_regex.circom](circuits/twitter_regex.circom). Please check the usage of zk-regex at its [readme.md](https://github.com/zkemail/zk-regex/tree/main?tab=readme-ov-file#how-to-use).

#### email-verifier

Build the main circuit with `email-verifier` and `twitter_regex.circom` (generated in former step).

### ptau

Due to the high amount of constraints in our generated circuits, you'd better use pot22 rather than 14 (used in snarkjs guide).
You could get the ptau file at <https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_22.ptau> or generate it by yourself.

**Note**:
If you want to get the other ptau files with different pot directly, check the table in [guide of snarkjs](https://github.com/iden3/snarkjs?tab=readme-ov-file#guide).

### Compile

Use circom to compile your circuit.

```
  circom -l node_modules circuits/main.circom -o build --r1cs --wasm --sym --c
```

- `-l`: specify the directory where the directive `include` should look for the circuits indicated.

- `circuits/twitter_regex.circom`: circom location.
- `-o`: output path.

**Fast path**:

```
  yarn run compile
```

### Input

You need the original email to generate the input file. Please put the file at `emls/twitter.eml`. Then run:

```
  yarn run input
```

### Witness

Generate the witness:

```
  node build/twitter_js/generate_witness.js build/twitter_js/twitter.wasm scripts/input.json proof/witness.wtns 
```

If you meet error here, check if all the files specified as input in the command are generated, i.e.:

- `build/twitter_js/generate_witness.js` generated during compile progress
- `build/twitter_js/twitter.wasm` generated during compile progress
- `scripts/input.json` generated with `scripts/generate-input.ts`

**Fast path**:

```
  yarn run wtns
```

### Setup

You can run:

```
  yarn run setup
```

which equals

```
  snarkjs groth16 setup build/twitter.r1cs circuits/powersOfTau28_hez_final_22.ptau proof/twitter_0000.zkey
```

This generates the reference `zkey` without phase 2 contributions.

`zkey` is a zero-knowledge key  that includes both the **proving key** and **verification key** as well as phase 2 contributions.

**IMPORTANT**: Do not use this `zkey` in production, as it's not safe. It requires at least a contribution,

#### Contribute to Phase 2 ceremony

1. First contribution to phase 2 ceremony.

```
  snarkjs zkey contribute proof/twitter_0000.zkey proof/twitter_0001.zkey --name="1st Contributor Name" -v
```

creates a zkey file with a new contribution.

2. Second contribution to phase 2 ceremony.

```
  snarkjs zkey contribute proof/twitter_0001.zkey proof/twitter_final.zkey --name="2nd Contributor Name" -v
```

#### Export Verification Key

In this project, I contributed twice.

Run `yarn run export-vk` to export the verification key.

which equals

```
  snarkjs zkey export verificationkey proof/twitter_final.zkey proof/verification_key.json
```

### Proof

Generate the proof with `twitter_final.zkey` and `twitter.wtns`:

```
 yarn run proof
```

Then, you'll get `proof.json` and `public.json`.

### Verify proof

```
  snarkjs groth16 verify proof/verification_key.json proof/public.json proof/proof.json
```

### Contract Verifier

Turn verifier into a smart contract:

```
  snarkjs zkey export solidityverifier proof/twitter_final.zkey contracts/TwitterVerifier.sol
```

Get the simulation verification call to verifier contract:

```
  snarkjs zkey export soliditycalldata proof/public.json proof/proof.json
```

We use `soliditycalldata` to simulate a verification call, and copy and paste the result directly in the verifyProof field in the deployed smart contract in the remix environment.

## File Structure

FYI.

```
├── README.md
├── build
│   ├── twitter.r1cs
│   ├── twitter.sym
│   ├── twitter_cpp
│   │   ├── Makefile
│   │   ├── calcwit.cpp
│   │   ├── calcwit.hpp
│   │   ├── circom.hpp
│   │   ├── fr.asm
│   │   ├── fr.cpp
│   │   ├── fr.hpp
│   │   ├── main.cpp
│   │   ├── twitter.cpp
│   │   └── twitter.dat
│   └── twitter_js
│       ├── generate_witness.js
│       ├── twitter.wasm
│       └── witness_calculator.js
├── circuits
│   ├── twitter.circom
│   └── twitter_regex.circom
├── contracts
│   └── TwitterVerifier.sol
├── emls
│   └── twitter.eml
├── package.json
├── powersOfTau28_hez_final_22.ptau
├── proof
│   ├── proof.json
│   ├── public.json
│   ├── twitter_0000.zkey
│   ├── twitter_0001.zkey
│   ├── twitter_final.zkey
│   ├── verification_key.json
│   └── witness.wtns
├── scripts
│   ├── generate-input.ts
│   └── input.json
└── yarn.lock
```

## Acknowledgement

- [snarkjs](https://github.com/iden3/snarkjs)
- [zk-email](https://zkemail.gitbook.io/zk-email/zk-email-verifier)
- [zk-regex](https://github.com/zkemail/zk-regex)
