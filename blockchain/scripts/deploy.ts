import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.getOrCreate();

  const [owner] = await ethers.getSigners();

  console.log("Owner:", owner.address);
  console.log("Verifier:", owner.address);

  const ClairFund =
    await ethers.getContractFactory("ClairFund");

  const clairFund =
    await ClairFund.deploy(owner.address);

  await clairFund.waitForDeployment();

  const contractAddress =
    await clairFund.getAddress();

  console.log(
    "CLAIR Fund deployed to:",
    contractAddress
  );

  console.log(
    "Verifier configured as:",
    await clairFund.verifier()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});