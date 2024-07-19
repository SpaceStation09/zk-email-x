# zk-email-starter (v1)

This is a starter project to implement proof of twitter with zk-email. This repo is still under construction.

## Usage

### Prerequisite

Make sure you have `snarkjs`, `rust` and `circom` installed.

Better get `just` installed.

### Install

Clone the repo and install all dependencies.

```bash
  yarn install
```

### With `Just`

```bash
  # Compile circuits
  just build_circuit

  # Generate circuit input. The default eml path is ./emls/twitter.eml
  just generate_input <YOUR-PATH-TO-EML>
  just generate_witness

  # Trusted setup for groth16 and export vk
  just snarkjs_setup

  # Generate and verify generated proof
  just proof

  # Generate contract verifier and export verification call data to contract verifier
  just generate_contract_verifier
```

To run contract test case, you should make sure you've compiled the circuit, and then run: `just contract_test`.

### Without `Just`

#### zk-regex

Build your twitter email regex circuit:

  Use [zk-regex](https://github.com/zkemail/zk-regex) to help generate [twitter_regex.circom](circuits/twitter_regex.circom). Please check the usage of zk-regex at its [readme.md](https://github.com/zkemail/zk-regex/tree/main?tab=readme-ov-file#how-to-use).

#### email-verifier

Build the main circuit with `email-verifier` and `twitter_regex.circom` (generated in former step).

### ptau

Due to the high amount of constraints in our generated circuits, you'd better use pot22 rather than pot14 (used in snarkjs guide).
You could get the ptau file at <https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_22.ptau> or generate it by yourself.

**Note**:
If you want to get the other ptau files with different pot directly, check the table in [guide of snarkjs](https://github.com/iden3/snarkjs?tab=readme-ov-file#guide).

### Compile

Use circom to compile your circuit.

```bash
  circom -l node_modules circuits/main.circom -o build --r1cs --wasm --sym --c
```

- `-l`: specify the directory where the directive `include` should look for the circuits indicated.

- `circuits/twitter_regex.circom`: circom location.
- `-o`: output path.

**Fast path**:

```bash
  yarn run compile
```

### Input

You need the original email to generate the input file. Please put the file at `emls/twitter.eml`. Then run:

```bash
  yarn run input <YOUR-PATH-TO-EML>
```

### Witness

Generate the witness:

```bash
  node build/twitter_js/generate_witness.js build/twitter_js/twitter.wasm scripts/input.json proof/witness.wtns 
```

If you meet error here, check if all the files specified as input in the command are generated, i.e.:

- `build/twitter_js/generate_witness.js` generated during compile progress
- `build/twitter_js/twitter.wasm` generated during compile progress
- `scripts/input.json` generated with `scripts/generate-input.ts`

**Fast path**:

```bash
  yarn run wtns
```

### Setup

**[Notice]**
You may meet `out of memory` issue during this step. Check at <https://github.com/iden3/snarkjs/issues/397> or see the `snarkjs_setup` recipe at [`justfile`](justfile).

You can run:

```bash
  yarn run setup
```

which equals

```bash
  snarkjs groth16 setup build/twitter.r1cs circuits/powersOfTau28_hez_final_22.ptau proof/twitter_0000.zkey
```

This generates the reference `zkey` without phase 2 contributions.

`zkey` is a zero-knowledge key  that includes both the **proving key** and **verification key** as well as phase 2 contributions.

**IMPORTANT**: Do not use this `zkey` in production, as it's not safe. It requires at least a contribution,

#### Contribute to Phase 2 ceremony

1. First contribution to phase 2 ceremony.

```bash
  snarkjs zkey contribute proof/twitter_0000.zkey proof/twitter_0001.zkey --name="1st Contributor Name" -v
```

creates a zkey file with a new contribution.

2. Second contribution to phase 2 ceremony.

```bash
  snarkjs zkey contribute proof/twitter_0001.zkey proof/twitter_final.zkey --name="2nd Contributor Name" -v
```

#### Export Verification Key

In this project, I contributed twice.

Run `yarn run export-vk` to export the verification key.

which equals

```bash
  snarkjs zkey export verificationkey proof/twitter_final.zkey proof/verification_key.json
```

### Proof

Generate the proof with `twitter_final.zkey` and `twitter.wtns`:

```bash
 yarn run proof
```

Then, you'll get `proof.json` and `public.json`.

### Verify proof

```bash
  snarkjs groth16 verify proof/verification_key.json proof/public.json proof/proof.json
```

### Contract Verifier

Turn verifier into a smart contract:

```bash
  snarkjs zkey export solidityverifier proof/twitter_final.zkey contracts/TwitterVerifier.sol
```

Get the simulation verification call to verifier contract:

```bash
  snarkjs zkey export soliditycalldata proof/public.json proof/proof.json
```

We use `soliditycalldata` to simulate a verification call, and copy and paste the result directly in the verifyProof field in the deployed smart contract in the remix environment.

### Rapidsnark

[`Rapidsnark`](https://github.com/iden3/rapidsnark) is a fast zkSNARK prover written in C++, that generates proofs for circuits created with circom and snarkjs. We could use `Rapidsnark` as an alternative to `snarkjs`.

### How to use in this project

1. Clone the `Rapidsnark` repo.
2. Follow the instructions in the guidance of `rapidsnark` to build `prover` & `verifier`.
3. The built prover is in the dir `package_***/bin`.
4. Copy the prover and paste it into this project.
5. You can now generate the proof with `<YOUR-PATH>/prover <circuit.zkey> <witness.wtns> <proof.json> <public.json>`

## File Structure

FYI.

```
├── Performance.txt
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
│   ├── IdentityGraph.sol
│   └── TwitterVerifier.sol
├── docs
│   ├── Components.md
│   └── SetUp.md
├── emls
│   └── twitter.eml
├── hardhat.config.ts
├── justfile
├── package-lock.json
├── package.json
├── pot22.ptau
├── project-words.txt
├── proof
│   ├── proof.json
│   ├── public.json
│   ├── twitter_0000.zkey
│   ├── twitter_final.zkey
│   ├── verification_key.json
│   └── witness.wtns
├── scripts
│   ├── contract-calldata.json
│   ├── generate-calldata.ts
│   ├── generate-input.ts
│   └── input.json
├── tsconfig.json
└── yarn.lock
```

## Acknowledgement

- [snarkjs](https://github.com/iden3/snarkjs)
- [zk-email](https://zkemail.gitbook.io/zk-email/zk-email-verifier)
- [zk-regex](https://github.com/zkemail/zk-regex)
