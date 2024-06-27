import { Signer } from "ethers";
import hre from "hardhat";
import {expect} from "chai";
import { DKIMRegistry, Groth16Verifier, IdentityGraph } from "../types";
import {
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { generatedProof, generatedSignal, twitterDKIMPubkeyHash1, twitterDKIMPubkeyHash2 } from "./constants";



describe("Identity Graph test", () => {
  let signers: Signer[];
  let deployer: Signer;
  let identityGraph: IdentityGraph;
  let verifier: Groth16Verifier;
  let dkim: DKIMRegistry;
  let snapshot: SnapshotRestorer;

  before(async () => {
    signers = await hre.ethers.getSigners();
    deployer = signers[0];

    dkim = await hre.ethers.deployContract("DKIMRegistry", [await deployer.getAddress()]);
    await dkim.setDKIMPublicKeyHash("x.com", twitterDKIMPubkeyHash1);
    await dkim.setDKIMPublicKeyHash("x.com", twitterDKIMPubkeyHash2);
    verifier = await hre.ethers.deployContract("Groth16Verifier");
    identityGraph = await hre.ethers.deployContract("IdentityGraph", [await verifier.getAddress(), await dkim.getAddress()]);
  });

  beforeEach(async () => {
    snapshot = await takeSnapshot();
  })

  afterEach(async () => {
    await snapshot.restore();
  })
  
  it("normal workflow", async () => {
    await identityGraph.bindIdentity("x.com", generatedProof, generatedSignal);
    const BindingEvents = await identityGraph.queryFilter(identityGraph.filters.IdentityBinding());
    const domain = BindingEvents[0]!.args.domain;
    const twitterUsername = BindingEvents[0]!.args.userId;
    expect(domain).to.be.eq("x.com");
    expect(twitterUsername).to.be.eq("space_station09");
  })
})