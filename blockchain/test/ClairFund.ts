import { expect } from "chai";
import hre from "hardhat";

describe("ClairFund", function () {
  async function deployClairFund() {
    const { ethers } = await hre.network.getOrCreate();

    const [
      owner,
      verifier,
      ngo,
      donor,
      recipient,
      attacker,
    ] = await ethers.getSigners();

    const ClairFund =
      await ethers.getContractFactory("ClairFund");

    const clairFund =
      await ClairFund.deploy(verifier.address);

    await clairFund.waitForDeployment();

    return {
      clairFund,
      owner,
      verifier,
      ngo,
      donor,
      recipient,
      attacker,
      ethers,
    };
  }

  it("should set the owner and verifier", async function () {
    const { clairFund, owner, verifier } =
      await deployClairFund();

    expect(await clairFund.owner())
      .to.equal(owner.address);

    expect(await clairFund.verifier())
      .to.equal(verifier.address);
  });

  it("should allow an NGO to create a campaign", async function () {
    const { clairFund, ngo, ethers } =
      await deployClairFund();

    const target = ethers.parseEther("5");

    await clairFund
      .connect(ngo)
      .createCampaign(target);

    const campaign =
      await clairFund.campaigns(1);

    expect(campaign.ngo)
      .to.equal(ngo.address);

    expect(campaign.targetAmount)
      .to.equal(target);

    expect(campaign.raisedAmount)
      .to.equal(0);

    expect(campaign.releasedAmount)
      .to.equal(0);

    expect(campaign.active)
      .to.equal(true);
  });

  it("should allow a donor to pledge funds", async function () {
    const { clairFund, ngo, donor, ethers } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    const pledgeAmount =
      ethers.parseEther("3");

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: pledgeAmount,
      });

    const campaign =
      await clairFund.campaigns(1);

    const donorPledge =
      await clairFund.pledges(
        1,
        donor.address
      );

    expect(campaign.raisedAmount)
      .to.equal(pledgeAmount);

    expect(donorPledge)
      .to.equal(pledgeAmount);
  });

  it("should allow the NGO to create a milestone with a recipient", async function () {
    const { clairFund, ngo, recipient, ethers } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    const amount =
      ethers.parseEther("2");

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase medical supplies",
        amount,
        recipient.address
      );

    const milestone =
      await clairFund.getMilestone(1, 0);

    expect(milestone.description)
      .to.equal(
        "Purchase medical supplies"
      );

    expect(milestone.amount)
      .to.equal(amount);

    expect(milestone.recipient)
      .to.equal(recipient.address);

    expect(milestone.approved)
      .to.equal(false);

    expect(milestone.released)
      .to.equal(false);
  });

  it("should prevent milestones from exceeding campaign target", async function () {
    const { clairFund, ngo, recipient, ethers } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Milestone 1",
        ethers.parseEther("4"),
        recipient.address
      );

    await expect(
      clairFund
        .connect(ngo)
        .createMilestone(
          1,
          "Milestone 2",
          ethers.parseEther("2"),
          recipient.address
        )
    ).to.be.revertedWith(
      "Milestones exceed campaign target"
    );
  });

  it("should allow the verifier to approve a milestone", async function () {
    const {
      clairFund,
      ngo,
      verifier,
      recipient,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        ethers.parseEther("2"),
        recipient.address
      );

    await clairFund
      .connect(verifier)
      .approveMilestone(1, 0);

    const milestone =
      await clairFund.getMilestone(1, 0);

    expect(milestone.approved)
      .to.equal(true);
  });

  it("should prevent the NGO from approving its own milestone", async function () {
    const { clairFund, ngo, recipient, ethers } =
      await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        ethers.parseEther("2"),
        recipient.address
      );

    await expect(
      clairFund
        .connect(ngo)
        .approveMilestone(1, 0)
    ).to.be.revertedWith(
      "Only verifier can perform this action"
    );
  });

  it("should release approved milestone funds to the recipient", async function () {
    const {
      clairFund,
      ngo,
      verifier,
      donor,
      recipient,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    const milestoneAmount =
      ethers.parseEther("2");

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        milestoneAmount,
        recipient.address
      );

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("3"),
      });

    await clairFund
      .connect(verifier)
      .approveMilestone(1, 0);

    const recipientBalanceBefore =
      await ethers.provider.getBalance(
        recipient.address
      );

    const tx =
      await clairFund
        .connect(verifier)
        .releaseMilestoneFunds(1, 0);

    await tx.wait();

    const recipientBalanceAfter =
      await ethers.provider.getBalance(
        recipient.address
      );

    expect(
      recipientBalanceAfter -
      recipientBalanceBefore
    ).to.equal(milestoneAmount);

    const campaign =
      await clairFund.campaigns(1);

    const milestone =
      await clairFund.getMilestone(1, 0);

    const balance =
      await clairFund.getContractBalance();

    expect(campaign.releasedAmount)
      .to.equal(milestoneAmount);

    expect(milestone.released)
      .to.equal(true);

    expect(balance)
      .to.equal(
        ethers.parseEther("1")
      );
  });

  it("should prevent an unapproved milestone from being released", async function () {
    const {
      clairFund,
      ngo,
      verifier,
      donor,
      recipient,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        ethers.parseEther("2"),
        recipient.address
      );

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("3"),
      });

    await expect(
      clairFund
        .connect(verifier)
        .releaseMilestoneFunds(1, 0)
    ).to.be.revertedWith(
      "Milestone not approved"
    );
  });

  it("should prevent a non-verifier from releasing funds", async function () {
    const {
      clairFund,
      ngo,
      verifier,
      donor,
      attacker,
      recipient,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        ethers.parseEther("2"),
        recipient.address
      );

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("3"),
      });

    await clairFund
      .connect(verifier)
      .approveMilestone(1, 0);

    await expect(
      clairFund
        .connect(attacker)
        .releaseMilestoneFunds(1, 0)
    ).to.be.revertedWith(
      "Only verifier can perform this action"
    );
  });

  it("should prevent a milestone from being released twice", async function () {
    const {
      clairFund,
      ngo,
      verifier,
      donor,
      recipient,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    const amount =
      ethers.parseEther("2");

    await clairFund
      .connect(ngo)
      .createMilestone(
        1,
        "Purchase supplies",
        amount,
        recipient.address
      );

    await clairFund
      .connect(donor)
      .pledge(1, {
        value: ethers.parseEther("3"),
      });

    await clairFund
      .connect(verifier)
      .approveMilestone(1, 0);

    await clairFund
      .connect(verifier)
      .releaseMilestoneFunds(1, 0);

    await expect(
      clairFund
        .connect(verifier)
        .releaseMilestoneFunds(1, 0)
    ).to.be.revertedWith(
      "Milestone already released"
    );
  });

  it("should allow the owner to change the verifier", async function () {
    const { clairFund, owner, attacker } =
      await deployClairFund();

    await clairFund
      .connect(owner)
      .setVerifier(attacker.address);

    expect(
      await clairFund.verifier()
    ).to.equal(attacker.address);
  });

  it("should prevent a non-owner from changing the verifier", async function () {
    const { clairFund, attacker } =
      await deployClairFund();

    await expect(
      clairFund
        .connect(attacker)
        .setVerifier(attacker.address)
    ).to.be.revertedWith(
      "Only owner can perform this action"
    );
  });

  // ----------------------------------------
  // SECURITY / STATE TESTS
  // ----------------------------------------

  it("should prevent pledges from exceeding the campaign target", async function () {
    const {
      clairFund,
      ngo,
      donor,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await expect(
      clairFund
        .connect(donor)
        .pledge(1, {
          value: ethers.parseEther("6"),
        })
    ).to.be.revertedWith(
      "Pledge exceeds campaign target"
    );
  });

  it("should allow the NGO to close its campaign", async function () {
    const {
      clairFund,
      ngo,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .closeCampaign(1);

    const campaign =
      await clairFund.campaigns(1);

    expect(campaign.active)
      .to.equal(false);
  });

  it("should prevent pledges after a campaign is closed", async function () {
    const {
      clairFund,
      ngo,
      donor,
      ethers,
    } = await deployClairFund();

    await clairFund
      .connect(ngo)
      .createCampaign(
        ethers.parseEther("5")
      );

    await clairFund
      .connect(ngo)
      .closeCampaign(1);

    await expect(
      clairFund
        .connect(donor)
        .pledge(1, {
          value: ethers.parseEther("1"),
        })
    ).to.be.revertedWith(
      "Campaign is not active"
    );
  });
});