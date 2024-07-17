default: 
  just --list

contract_clean: 
  rm -r ./artifacts
  rm -r ./cache

clean: contract_clean
  rm -r ./build

default := './emls/twitter.eml'

generate_input eml_file=default:
  echo 'Generate input from {{eml_file}}'
  ts-node scripts/generate-input.ts {{eml_file}}

build_circuit:
  mkdir build
  yarn run compile
  ls -lh ./build

# Download pot 22 (2^22) ptau file to suit the constraints amount of our circuit
ptau_download:
  # check if ptau file exists in advance
  [ -f ./pot22.ptau ] || wget -O ./pot22.ptau "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_22.ptau"

generate_witness:
  mkdir proof
  yarn run wtns
  snarkjs wtns check build/twitter.r1cs proof/witness.wtns

snarkjs_setup: ptau_download
  # Need extra node option to increase memory limit.
  # Check problem detail at: https://github.com/iden3/snarkjs/issues/397
  NODE_OPTIONS="--max-old-space-size=655300" snarkjs groth16 setup build/twitter.r1cs ./pot22.ptau proof/twitter_0000.zkey | gnomon

  # You need to enter a random text to provide extra source of entropy
  yarn run snarkjs zkey contribute proof/twitter_0000.zkey proof/twitter_0001.zkey --name="1st Contributor Name" -v
  yarn run snarkjs zkey contribute proof/twitter_0001.zkey proof/twitter_final.zkey --name="2nd Contributor Name" -v
  # Export the vk
  yarn run snarkjs zkey export verificationkey proof/twitter_final.zkey proof/verification_key.json

generate_proof:
	# Proof and public signal generated in ./proof
	yarn run snarkjs groth16 prove proof/twitter_final.zkey proof/witness.wtns proof/proof.json proof/public.json

verify_proof:
	yarn run snarkjs groth16 verify proof/verification_key.json proof/public.json proof/proof.json

proof: generate_proof verify_proof

generate_contract_verifier:
	# Contract verifier generated at contracts/TwitterVerifier.sol
	yarn run snarkjs zkey export solidityverifier proof/twitter_final.zkey contracts/TwitterVerifier.sol
	# Generate a verification call data to contract verifier
	ts-node scripts/generate-calldata.ts