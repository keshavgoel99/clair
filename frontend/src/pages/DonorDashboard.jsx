import { useEffect, useState } from "react";

import {
  connectWallet,
  pledgeToCampaign,
} from "../blockchain/clairFund";


function DonorDashboard() {
  const [campaigns, setCampaigns] = useState([]);

  const [
    loadingCampaigns,
    setLoadingCampaigns,
  ] = useState(true);

  const [
    campaignError,
    setCampaignError,
  ] = useState("");

  const [
    selectedCampaign,
    setSelectedCampaign,
  ] = useState(null);

  const [
    pledgeAmount,
    setPledgeAmount,
  ] = useState("");

  const [
    pledging,
    setPledging,
  ] = useState(false);

  const [
    pledgeError,
    setPledgeError,
  ] = useState("");

  const [
    pledges,
    setPledges,
  ] = useState([]);

  const [
    loadingPledges,
    setLoadingPledges,
  ] = useState(true);

  const [
    pledgeHistoryError,
    setPledgeHistoryError,
  ] = useState("");

  const [procurements, setProcurements] = useState([]);
  const [loadingProcurements, setLoadingProcurements] = useState(true);
  const [procurementError, setProcurementError] = useState("");

  // =====================================================
  // DONOR WALLET
  // =====================================================

  const [walletAddress, setWalletAddress] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");


  // =====================================================
  // TOTAL PLEDGED
  // =====================================================

  const totalPledged =
    pledges.reduce(
      (total, pledge) =>
        total +
        Number(pledge.amount || 0),
      0
    );


  // =====================================================
  // CAMPAIGN CONTRIBUTION
  // =====================================================

  const getCampaignContribution = (campaignId) => {
    return pledges
      .filter(
        (pledge) =>
          Number(pledge.campaignId) ===
          Number(campaignId)
      )
      .reduce(
        (total, pledge) =>
          total +
          Number(pledge.amount || 0),
        0
      );
  };


  // =====================================================
  // FETCH SAVED WALLET
  // =====================================================

  const fetchWallet = async () => {
    try {
      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        return;
      }

      const response =
        await fetch(
          "http://localhost:5000/api/auth/wallet",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to fetch wallet"
        );
      }

      setWalletAddress(
        data.walletAddress || ""
      );

    } catch (error) {
      console.error(
        "Error fetching wallet:",
        error
      );
    }
  };


  // =====================================================
  // CONNECT + SAVE WALLET
  // =====================================================

  const handleConnectWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError("");

      const token =
        localStorage.getItem(
          "clairToken"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const wallet =
        await connectWallet();

      if (!wallet?.address) {
        throw new Error(
          "Unable to get wallet address."
        );
      }

      const response =
        await fetch(
          "http://localhost:5000/api/auth/wallet",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              walletAddress:
                wallet.address,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to save wallet address"
        );
      }

      setWalletAddress(
        data.user?.walletAddress ||
        wallet.address.toLowerCase()
      );

    } catch (error) {
      console.error(
        "Wallet connection error:",
        error
      );

      setWalletError(
        error.message ||
        "Unable to connect wallet"
      );

    } finally {
      setWalletLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCampaigns();
    fetchMyPledges();
    fetchDonorProcurements();
    fetchWallet();
  }, []);


  // =====================================================
  // FETCH ACTIVE CAMPAIGNS
  // =====================================================

  const fetchCampaigns =
    async () => {
      try {
        setLoadingCampaigns(true);
        setCampaignError("");

        const token =
          localStorage.getItem(
            "clairToken"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const response =
          await fetch(
            "http://localhost:5000/api/campaigns",
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load campaigns"
          );
        }

        setCampaigns(
          data.campaigns || []
        );

      } catch (error) {
        console.error(
          "Error loading campaigns:",
          error
        );

        setCampaignError(
          error.message
        );

      } finally {
        setLoadingCampaigns(false);
      }
    };


  // =====================================================
  // FETCH MY PLEDGES
  // =====================================================

  const fetchMyPledges =
    async () => {
      try {
        setLoadingPledges(true);
        setPledgeHistoryError("");

        const token =
          localStorage.getItem(
            "clairToken"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const response =
          await fetch(
            "http://localhost:5000/api/pledges/my",
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load pledge history"
          );
        }

        setPledges(
          data.pledges || []
        );

      } catch (error) {
        console.error(
          "Error loading pledges:",
          error
        );

        setPledgeHistoryError(
          error.message
        );

      } finally {
        setLoadingPledges(false);
      }
    };


  // =====================================================
  // FETCH DONOR PROCUREMENTS
  // =====================================================

  const fetchDonorProcurements =
    async () => {
      try {
        setLoadingProcurements(true);
        setProcurementError("");

        const token =
          localStorage.getItem(
            "clairToken"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const response =
          await fetch(
            "http://localhost:5000/api/procurements/donor",
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load procurement information"
          );
        }

        setProcurements(
          data.procurements || []
        );

      } catch (error) {
        console.error(
          "Error loading procurements:",
          error
        );

        setProcurementError(
          error.message
        );

      } finally {
        setLoadingProcurements(false);
      }
    };


  // =====================================================
  // OPEN PLEDGE FORM
  // =====================================================

  const openPledgeForm =
    (campaign) => {
      setSelectedCampaign(
        campaign
      );

      setPledgeAmount("");
      setPledgeError("");
    };


  // =====================================================
  // CLOSE PLEDGE FORM
  // =====================================================

  const closePledgeForm =
    () => {
      if (pledging) {
        return;
      }

      setSelectedCampaign(null);
      setPledgeAmount("");
      setPledgeError("");
    };


  // =====================================================
  // HANDLE PLEDGE
  // =====================================================

  const handlePledge =
    async () => {
      try {
        setPledgeError("");

        if (!walletAddress) {
          throw new Error(
            "Please connect your MetaMask wallet before making a blockchain pledge."
          );
        }

        if (!selectedCampaign) {
          throw new Error(
            "No campaign selected."
          );
        }

        if (
          !selectedCampaign.blockchainCampaignId
        ) {
          throw new Error(
            "This campaign is not linked to a blockchain campaign."
          );
        }

        const amount =
          Number(pledgeAmount);

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          throw new Error(
            "Enter a valid pledge amount."
          );
        }

        setPledging(true);

        const blockchainResult =
          await pledgeToCampaign(
            selectedCampaign.blockchainCampaignId,
            amount
          );

        const token =
          localStorage.getItem(
            "clairToken"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const response =
          await fetch(
            "http://localhost:5000/api/pledges",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                campaignId:
                  selectedCampaign.id,

                amount,

                blockchainTx:
                  blockchainResult.hash,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to save pledge"
          );
        }

        setSelectedCampaign(null);
        setPledgeAmount("");

        await fetchMyPledges();
        await fetchCampaigns();

        alert(
          `Pledge successful!\n\nTransaction:\n${blockchainResult.hash}`
        );

      } catch (error) {
        console.error(
          "Pledge error:",
          error
        );

        setPledgeError(
          error.message ||
          "Unable to complete pledge"
        );

      } finally {
        setPledging(false);
      }
    };


  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Donor Dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Your Contributions
        </h2>
      </div>


      {/* =====================================================
          DONOR WALLET
      ===================================================== */}

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Blockchain Wallet
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Connect your MetaMask wallet to make verified blockchain pledges.
            </p>

            {walletAddress && (
              <p className="mt-2 break-all text-xs font-medium text-slate-700">
                Connected: {walletAddress}
              </p>
            )}
          </div>

          <button
            onClick={
              handleConnectWallet
            }
            disabled={
              walletLoading
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {walletLoading
              ? "Connecting..."
              : walletAddress
                ? "Reconnect Wallet"
                : "Connect MetaMask"}
          </button>

        </div>

        {walletError && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {walletError}
          </p>
        )}

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <p className="text-sm text-slate-500">
            Total Pledged
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹
            {totalPledged.toLocaleString(
              "en-IN"
            )}
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <p className="text-sm text-slate-500">
            Active Pledges
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {pledges.length}
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <p className="text-sm text-slate-500">
            Verified Contributions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              pledges.filter(
                (pledge) =>
                  pledge.status ===
                  "UTILIZED"
              ).length
            }
          </p>

        </div>

      </div>


      {/* =====================================================
          AVAILABLE CAMPAIGNS
      ===================================================== */}

      <section className="mt-12">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-xl font-bold text-slate-900">
              Campaigns Needing Support
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Find a campaign you want to support.
            </p>

          </div>


          <button
            onClick={
              fetchCampaigns
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>


        {loadingCampaigns && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">
              Loading campaigns...
            </p>
          </div>
        )}


        {!loadingCampaigns &&
          campaignError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6">

              <p className="font-medium text-red-700">
                {campaignError}
              </p>

              <button
                onClick={
                  fetchCampaigns
                }
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Try Again
              </button>

            </div>
          )}


        {!loadingCampaigns &&
          !campaignError &&
          campaigns.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <p className="font-medium text-slate-700">
                No active campaigns
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Check back later for campaigns
                needing support.
              </p>

            </div>
          )}


        {!loadingCampaigns &&
          !campaignError &&
          campaigns.length > 0 && (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {campaigns.map(
                (campaign) => {

                  const target =
                    Number(
                      campaign.target
                    ) || 0;

                  const raised =
                    Number(
                      campaign.raisedAmount
                    ) || 0;

                  const progress =
                    target > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (raised /
                              target) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={
                        campaign.id
                      }
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        {
                          campaign.category
                        }
                      </p>

                      <h4 className="mt-2 text-lg font-bold text-slate-900">
                        {
                          campaign.title
                        }
                      </h4>

                      {campaign.ngo && (
                        <p className="mt-1 text-sm text-slate-500">
                          By{" "}
                          {
                            campaign.ngo.name
                          }
                        </p>
                      )}

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {
                          campaign.description
                        }
                      </p>

                      <div className="mt-5 flex justify-between text-sm">

                        <span className="text-slate-500">
                          Raised
                        </span>

                        <span className="font-semibold text-slate-900">
                          ₹
                          {raised.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="mt-1 flex justify-between text-sm">

                        <span className="text-slate-500">
                          Target
                        </span>

                        <span className="font-semibold text-slate-900">
                          ₹
                          {target.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {progress}% funded
                      </p>

                      {campaign.blockchainCampaignId && (
                        <p className="mt-3 text-xs text-slate-500">
                          Blockchain Campaign ID:{" "}
                          <span className="font-semibold">
                            {
                              campaign.blockchainCampaignId
                            }
                          </span>
                        </p>
                      )}

                      <button
                        onClick={() => {
                          if (!walletAddress) {
                            setWalletError(
                              "Please connect your MetaMask wallet before making a blockchain pledge."
                            );
                            return;
                          }

                          openPledgeForm(
                            campaign
                          );
                        }}
                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        {walletAddress
                          ? "Pledge to this Campaign"
                          : "Connect Wallet to Pledge"}
                      </button>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </section>


      {/* =====================================================
          PLEDGE HISTORY
      ===================================================== */}

      <section className="mt-12">

        <h3 className="text-xl font-bold text-slate-900">
          Pledge History
        </h3>

        {pledgeHistoryError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5">

            <p className="font-medium text-red-700">
              {pledgeHistoryError}
            </p>

          </div>
        )}

        {loadingPledges ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center">

            <p className="text-slate-500">
              Loading pledge history...
            </p>

          </div>
        ) : (
          <div className="mt-4 space-y-4">

            {pledges.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <p className="font-medium text-slate-700">
                  No pledges yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your contributions will appear here.
                </p>

              </div>
            ) : (
              pledges.map(
                (pledge) => (
                  <div
                    key={
                      pledge.id
                    }
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >

                    <div className="flex items-center justify-between gap-5">

                      <div>

                        <h4 className="font-semibold text-slate-900">
                          {
                            pledge.campaign.title
                          }
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            pledge.campaign.ngo?.name
                          }
                        </p>

                        {pledge.blockchainTx && (
                          <p className="mt-2 break-all text-xs text-slate-500">
                            Tx:{" "}
                            {
                              pledge.blockchainTx
                            }
                          </p>
                        )}

                      </div>

                      <div className="text-right">

                        <p className="font-bold text-slate-900">
                          ₹
                          {Number(
                            pledge.amount ||
                            0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <span
                          className={
                            pledge.status ===
                            "LOCKED"
                              ? "text-xs font-medium text-blue-600"
                              : "text-xs font-medium text-amber-600"
                          }
                        >
                          {
                            pledge.status ||
                            "PLEDGED"
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>
        )}

      </section>


      {/* =====================================================
          PROCUREMENT TRANSPARENCY
      ===================================================== */}

      <section style={{ marginTop: "40px" }}>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                color: "#111827",
              }}
            >
              🔍 Fund Utilization & Transparency
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Track how campaign funds are being used — from procurement
              to vendor delivery and verification.
            </p>

          </div>

          <button
            onClick={
              fetchDonorProcurements
            }
            disabled={
              loadingProcurements
            }
            style={{
              padding: "9px 14px",
              borderRadius: "8px",
              border:
                "1px solid #d1d5db",
              background: "#ffffff",
              cursor:
                loadingProcurements
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "600",
            }}
          >
            ↻ Refresh
          </button>

        </div>


        {loadingProcurements && (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
              background: "#f9fafb",
              borderRadius: "12px",
            }}
          >
            Loading procurement information...
          </div>
        )}


        {!loadingProcurements &&
          procurementError && (
            <div
              style={{
                padding: "16px",
                background: "#fef2f2",
                border:
                  "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "10px",
              }}
            >
              {procurementError}
            </div>
          )}


        {!loadingProcurements &&
          !procurementError &&
          procurements.length === 0 && (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                background: "#f9fafb",
                borderRadius: "12px",
                border:
                  "1px solid #e5e7eb",
              }}
            >

              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                📋
              </div>

              <strong>
                No procurement activity yet
              </strong>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Procurement details will appear here once funds from
                your supported campaigns are utilized.
              </p>

            </div>
          )}


        {!loadingProcurements &&
          !procurementError &&
          procurements.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
              }}
            >

              {procurements.map(
                (procurement) => {

                  const verificationStatus =
                    procurement.verification?.status ||
                    "NOT_STARTED";

                  return (
                    <div
                      key={
                        procurement.id
                      }
                      style={{
                        background:
                          "#ffffff",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "14px",
                        padding:
                          "20px",
                        boxShadow:
                          "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            "12px",
                          fontWeight:
                            "700",
                          color:
                            "#6b7280",
                          textTransform:
                            "uppercase",
                          marginBottom:
                            "6px",
                        }}
                      >
                        Campaign
                      </div>

                      <h3
                        style={{
                          margin:
                            "0 0 16px",
                          fontSize:
                            "18px",
                          color:
                            "#111827",
                        }}
                      >
                        {
                          procurement
                            .campaign
                            ?.title ||
                          "Unknown Campaign"
                        }
                      </h3>


                      <div
                        style={{
                          padding:
                            "12px 14px",
                          background:
                            "#f0fdf4",
                          border:
                            "1px solid #bbf7d0",
                          borderRadius:
                            "10px",
                          marginBottom:
                            "14px",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "11px",
                            fontWeight:
                              "700",
                            color:
                              "#166534",
                            textTransform:
                              "uppercase",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Your Contribution to Campaign
                        </div>

                        <div
                          style={{
                            fontSize:
                              "20px",
                            fontWeight:
                              "800",
                            color:
                              "#166534",
                          }}
                        >
                          ₹
                          {getCampaignContribution(
                            procurement
                              .campaign
                              ?.id
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                      </div>


                      <div
                        style={{
                          padding:
                            "14px",
                          background:
                            "#f9fafb",
                          borderRadius:
                            "10px",
                          marginBottom:
                            "14px",
                        }}
                      >

                        <div
                          style={{
                            fontWeight:
                              "700",
                            color:
                              "#111827",
                            marginBottom:
                              "5px",
                          }}
                        >
                          {
                            procurement.title
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "13px",
                            color:
                              "#6b7280",
                            lineHeight:
                              "1.5",
                          }}
                        >
                          {
                            procurement.description
                          }
                        </div>

                      </div>


                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap:
                            "12px",
                          marginBottom:
                            "16px",
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#9ca3af",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            Vendor
                          </div>

                          <div
                            style={{
                              fontWeight:
                                "600",
                              marginTop:
                                "3px",
                            }}
                          >
                            {
                              procurement
                                .vendor
                                ?.name ||
                              "Not assigned"
                            }
                          </div>

                        </div>


                        <div>

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#9ca3af",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            Procurement Value
                          </div>

                          <div
                            style={{
                              fontWeight:
                                "700",
                              marginTop:
                                "3px",
                            }}
                          >
                            ₹
                            {Number(
                              procurement.amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </div>

                        </div>

                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          paddingTop:
                            "14px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#9ca3af",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            Procurement Status
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontWeight:
                                "700",
                              fontSize:
                                "13px",
                            }}
                          >
                            {
                              procurement.status
                                .replaceAll(
                                  "_",
                                  " "
                                )
                            }
                          </div>

                        </div>


                        <div>

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#9ca3af",
                              textTransform:
                                "uppercase",
                              textAlign:
                                "right",
                            }}
                          >
                            Verification
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontWeight:
                                "700",
                              fontSize:
                                "13px",
                              textAlign:
                                "right",
                            }}
                          >
                            {
                              verificationStatus
                                .replaceAll(
                                  "_",
                                  " "
                                )
                            }
                          </div>

                        </div>

                      </div>


                      {procurement.documents?.length > 0 && (
                        <div
                          style={{
                            marginTop:
                              "16px",
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#9ca3af",
                              textTransform:
                                "uppercase",
                              marginBottom:
                                "8px",
                            }}
                          >
                            Procurement Proof
                          </div>

                          {procurement.documents.map(
                            (document) => (
                              <div
                                key={
                                  document.id
                                }
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "center",
                                  padding:
                                    "9px 10px",
                                  background:
                                    "#f9fafb",
                                  borderRadius:
                                    "7px",
                                  marginBottom:
                                    "6px",
                                }}
                              >

                                <span
                                  style={{
                                    fontSize:
                                      "13px",
                                    color:
                                      "#374151",
                                  }}
                                >
                                  📄{" "}
                                  {
                                    document.name ||
                                    document.fileName ||
                                    "Document"
                                  }
                                </span>

                                {(document.url ||
                                  document.fileUrl ||
                                  document.path) && (
                                  <a
                                    href={
                                      document.url ||
                                      document.fileUrl ||
                                      document.path
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize:
                                        "12px",
                                      fontWeight:
                                        "600",
                                      color:
                                        "#2563eb",
                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    View
                                  </a>
                                )}

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </section>


      {/* =====================================================
          PLEDGE MODAL
      ===================================================== */}

      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Make a Blockchain Pledge
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {
                    selectedCampaign.title
                  }
                </h3>

              </div>


              <button
                onClick={
                  closePledgeForm
                }
                disabled={
                  pledging
                }
                className="text-2xl text-slate-400 hover:text-slate-700 disabled:opacity-40"
              >
                ×
              </button>

            </div>


            <p className="mt-4 text-sm text-slate-600">
              Your pledge will be sent through
              MetaMask to the ClairFund smart
              contract on Sepolia.
            </p>


            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Pledge Amount (Sepolia ETH)
            </label>


            <input
              type="number"
              min="0.0001"
              step="0.0001"
              placeholder="0.01"
              value={
                pledgeAmount
              }
              onChange={(e) =>
                setPledgeAmount(
                  e.target.value
                )
              }
              disabled={
                pledging
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
            />


            {pledgeError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {
                  pledgeError
                }
              </p>
            )}


            <div className="mt-6 flex gap-3">

              <button
                onClick={
                  closePledgeForm
                }
                disabled={
                  pledging
                }
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                onClick={
                  handlePledge
                }
                disabled={
                  pledging ||
                  !pledgeAmount ||
                  Number(
                    pledgeAmount
                  ) <= 0 ||
                  !walletAddress
                }
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pledging
                  ? "Processing..."
                  : "Confirm Pledge"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


export default DonorDashboard;