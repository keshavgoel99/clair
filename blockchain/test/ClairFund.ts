import { expect } from "chai";
import hre from "hardhat";
const { ethers } = await hre.network.connect();

describe("ClairFund", function () {
  async function deployClairFund() {
    const [ngo, donor, recipient, attacker] =
      await ethers.getSigners();

    const ClairFund = await ethers.getContractFactory("ClairFund");

    const clairFund = await ClairFund.deploy();

    await clairFund.waitForDeployment();

    return {
      clairFund,
      ngo,
      donor,
      recipient,
      attacker,
    };
  }

  it("should allow an NGO to create a campaign", async function () {
    const { clairFund, ngo } = await deployClairFund();

    const target = ethers.parseEther("5");

    await clairFund.connect(ngo).createCampaign(target);

    const campaign = await clairFund.campaigns(1);

    expect(campaign.ngo).to.equal(ngo.address);
    expect(campaign.targetAmount).to.equal(target);
    expect(campaign.raisedAmount).to.equal(0);
    expect(campaign.active).to.equal(true);
  });

  it("should allow a donor to pledge funds", async function () {
    const { clairFund, ngo, donor } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(ethers.parseEther("5"));

    const pledgeAmount = ethers.parseEther("1");

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: pledgeAmount,
      });

    const campaign = await clairFund.campaigns(1);

    const donorPledge =
      await clairFund.pledges(1, donor.address);

    expect(campaign.raisedAmount).to.equal(pledgeAmount);
    expect(donorPledge).to.equal(pledgeAmount);
  });

  it("should store pledged funds in the contract", async function () {
    const { clairFund, ngo, donor } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(ethers.parseEther("5"));

    const pledgeAmount = ethers.parseEther("2");

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: pledgeAmount,
      });

    const balance =
      await clairFund.getContractBalance();

    expect(balance).to.equal(pledgeAmount);
  });

  it("should allow the NGO to release funds", async function () {
    const { clairFund, ngo, donor, recipient } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(ethers.parseEther("5"));

    const pledgeAmount = ethers.parseEther("2");

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: pledgeAmount,
      });

    const releaseAmount = ethers.parseEther("1");

    await clairFund
      .connect(ngo)
      .releaseFunds(
        1,
        recipient.address,
        releaseAmount
      );

    const balance =
      await clairFund.getContractBalance();

    expect(balance).to.equal(
      ethers.parseEther("1")
    );
  });

  it("should prevent a non-NGO from releasing funds", async function () {
    const { clairFund, ngo, donor, attacker, recipient } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(ethers.parseEther("5"));

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("2"),
      });

    await expect(
      clairFund
        .connect(attacker)
        .releaseFunds(
          1,
          recipient.address,
          ethers.parseEther("1")
        )
    ).to.be.revertedWith(
      "Only NGO can release funds"
    );
  });
});