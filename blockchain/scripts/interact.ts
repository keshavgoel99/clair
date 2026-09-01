import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.getOrCreate();

  const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const clairFund =
    await ethers.getContractAt(
      "ClairFund",
      contractAddress
    );

  const [
    owner,
    verifier,
    ngo,
    donor,
    recipient,
  ] = await ethers.getSigners();

  console.log("Owner:", owner.address);
  console.log("Verifier:", verifier.address);
  console.log("NGO:", ngo.address);
  console.log("Donor:", donor.address);
  console.log("Recipient:", recipient.address);

  // ----------------------------------------
  // 1. NGO creates campaign
  // ----------------------------------------

  console.log("\nCreating campaign...");

  const campaignTx =
    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

  await campaignTx.wait();

  console.log("Campaign created.");

  // ----------------------------------------
  // 2. Donor pledges 3 ETH
  // ----------------------------------------

  console.log("\nDonor pledging 3 ETH...");

  const pledgeTx =
    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("3"),
      });

  await pledgeTx.wait();

  console.log("Pledge successful.");

  // ----------------------------------------
  // 3. NGO creates milestone
  // ----------------------------------------

  console.log("\nCreating milestone...");

  const milestoneTx =
    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase medical supplies",
        ethers.parseEther("2"),
        recipient.address
      );

  await milestoneTx.wait();

  console.log("Milestone created.");

  // ----------------------------------------
  // 4. Verifier approves milestone
  // ----------------------------------------

  console.log("\nVerifier approving milestone...");

  const approvalTx =
    await clairFund
      .connect(verifier)
      .approveMilestone(1, 0);

  await approvalTx.wait();

  console.log("Milestone approved.");

  // ----------------------------------------
  // 5. Verifier releases funds
  // ----------------------------------------

  console.log("\nReleasing milestone funds...");

  const recipientBalanceBefore =
    await ethers.provider.getBalance(
      recipient.address
    );

  const releaseTx =
    await clairFund
      .connect(verifier)
      .releaseMilestoneFunds(1, 0);

  await releaseTx.wait();

  const recipientBalanceAfter =
    await ethers.provider.getBalance(
      recipient.address
    );

  console.log("Funds released.");

  // ----------------------------------------
  // 6. Final state
  // ----------------------------------------

  const campaign =
    await clairFund.campaigns(1);

  const milestone =
    await clairFund.getMilestone(1, 0);

  const contractBalance =
    await clairFund.getContractBalance();

  console.log("\n===== FINAL STATE =====");

  console.log(
    "Campaign raised:",
    ethers.formatEther(
      campaign.raisedAmount
    ),
    "ETH"
  );

  console.log(
    "Campaign released:",
    ethers.formatEther(
      campaign.releasedAmount
    ),
    "ETH"
  );

  console.log(
    "Milestone approved:",
    milestone.approved
  );

  console.log(
    "Milestone released:",
    milestone.released
  );

  console.log(
    "Milestone recipient:",
    milestone.recipient
  );

  console.log(
    "Recipient received:",
    ethers.formatEther(
      recipientBalanceAfter -
      recipientBalanceBefore
    ),
    "ETH"
  );

  console.log(
    "Contract balance:",
    ethers.formatEther(
      contractBalance
    ),
    "ETH"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});