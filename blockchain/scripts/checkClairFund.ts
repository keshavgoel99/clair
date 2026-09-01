import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.getOrCreate();

  const address =
    "0x6ae537E35AD24FD5c2A979218497104459366bcd";

  const clairFund = await ethers.getContractAt(
    "ClairFund",
    address
  );

  console.log("Contract:", address);
  console.log(
    "Campaign count:",
    (await clairFund.campaignCount()).toString()
  );
  console.log("Owner:", await clairFund.owner());
  console.log("Verifier:", await clairFund.verifier());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
