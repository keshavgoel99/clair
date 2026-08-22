import { useEffect, useState } from "react";

function DonorDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  const [selectedCampaign, setSelectedCampaign] =
    useState(null);

  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledging, setPledging] = useState(false);
  const [pledgeError, setPledgeError] = useState("");
  const [pledges, setPledges] = useState([]);
  const [loadingPledges, setLoadingPledges] = useState(true);
  const [pledgeHistoryError, setPledgeHistoryError] = useState("");

  const totalPledged = pledges.reduce(
    (total, pledge) =>
      total + Number(pledge.amount || 0),
    0
  );

  // -----------------------------------------
  // FETCH ACTIVE CAMPAIGNS
  // -----------------------------------------

  useEffect(() => {
    fetchCampaigns();
    fetchMyPledges();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      setCampaignError("");

      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "http://localhost:5000/api/campaigns",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load campaigns"
        );
      }

      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error(
        "Error loading campaigns:",
        error
      );

      setCampaignError(error.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };
  const fetchMyPledges = async () => {
  try {
    setLoadingPledges(true);
    setPledgeHistoryError("");

    const token = localStorage.getItem("clairToken");

    if (!token) {
      throw new Error("You are not logged in.");
    }

    const response = await fetch(
      "http://localhost:5000/api/pledges/my",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load pledge history"
      );
    }

    setPledges(data.pledges || []);
  } catch (error) {
    console.error("Pledge history error:", error);
    setPledgeHistoryError(error.message);
  } finally {
    setLoadingPledges(false);
  }
};
  // -----------------------------------------
  // OPEN PLEDGE FORM
  // -----------------------------------------

  const openPledgeForm = (campaign) => {
    setSelectedCampaign(campaign);
    setPledgeAmount("");
  };

  // -----------------------------------------
  // CLOSE PLEDGE FORM
  // -----------------------------------------

  const closePledgeForm = () => {
    setSelectedCampaign(null);
    setPledgeAmount("");
  };
const handlePledge = async () => {
  setPledgeError("");

  const amount = Number(pledgeAmount);

  if (!amount || amount <= 0) {
    setPledgeError(
      "Please enter a valid pledge amount."
    );
    return;
  }

  try {
    setPledging(true);

    const token =
      localStorage.getItem("clairToken");

    if (!token) {
      throw new Error(
        "You are not logged in."
      );
    }

    const response = await fetch(
      "http://localhost:5000/api/pledges",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          amount: amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create pledge"
      );
    }

    setSelectedCampaign(null);
    setPledgeAmount("");

    await fetchCampaigns();
    await fetchMyPledges();

    alert("Pledge created successfully!");

  } catch (error) {
    console.error(
      "Pledge error:",
      error
    );

    setPledgeError(error.message);

  } finally {
    setPledging(false);
  }
};
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      {/* HEADER */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Donor Dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Your Contributions
        </h2>
      </div>

      {/* STATISTICS */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Total Pledged
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹{totalPledged.toLocaleString("en-IN")}
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
            0
          </p>
        </div>

      </div>

      {/* ----------------------------------------- */}
      {/* AVAILABLE CAMPAIGNS */}
      {/* ----------------------------------------- */}

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
            onClick={fetchCampaigns}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

        {/* LOADING */}

        {loadingCampaigns && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">
              Loading campaigns...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loadingCampaigns &&
          campaignError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="font-medium text-red-700">
                {campaignError}
              </p>

              <button
                onClick={fetchCampaigns}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Try Again
              </button>
            </div>
          )}

        {/* NO CAMPAIGNS */}

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

        {/* CAMPAIGN CARDS */}

        {!loadingCampaigns &&
          !campaignError &&
          campaigns.length > 0 && (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {campaigns.map((campaign) => {

                const target =
                  Number(campaign.target) || 0;

                /*
                 * The current campaign API doesn't
                 * return a raised amount yet.
                 *
                 * We'll connect this when pledges
                 * are implemented.
                 */
const raised = (
  campaign.pledges || []
).reduce(
  (total, pledge) =>
    total + Number(pledge.amount || 0),
  0
);
                const progress =
                  target > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (raised / target) * 100
                        )
                      )
                    : 0;

                return (
                  <div
                    key={campaign.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    {/* CATEGORY */}

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {campaign.category}
                    </p>

                    {/* TITLE */}

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      {campaign.title}
                    </h4>

                    {/* NGO */}

                    {campaign.ngo && (
                      <p className="mt-1 text-sm text-slate-500">
                        By {campaign.ngo.name}
                      </p>
                    )}

                    {/* DESCRIPTION */}

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {campaign.description}
                    </p>

                    {/* TARGET */}

                    <div className="mt-5 flex justify-between text-sm">

                      <span className="text-slate-500">
                        Raised
                      </span>

                      <span className="font-semibold text-slate-900">
                        ₹{raised.toLocaleString("en-IN")}
                      </span>

                    </div>

                    <div className="mt-1 flex justify-between text-sm">

                      <span className="text-slate-500">
                        Target
                      </span>

                      <span className="font-semibold text-slate-900">
                        ₹{target.toLocaleString("en-IN")}
                      </span>

                    </div>

                    {/* PROGRESS BAR */}

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {progress}% funded
                    </p>

                    {/* PLEDGE BUTTON */}

                    <button
                      onClick={() =>
                        openPledgeForm(campaign)
                      }
                      className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      Pledge to this Campaign
                    </button>

                  </div>
                );
              })}

            </div>
          )}

      </section>

      {/* ----------------------------------------- */}
      {/* PLEDGE HISTORY */}
      {/* ----------------------------------------- */}

      <section className="mt-12">

        <h3 className="text-xl font-bold text-slate-900">
          Pledge History
        </h3>

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
            pledges.map((pledge) => (
              <div
                key={pledge.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {pledge.campaign.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {pledge.campaign.ngo?.name}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-bold text-slate-900">
                      ₹
                      {Number(
                        pledge.amount || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <span className="text-xs font-medium text-amber-600">
                      Pledged
                    </span>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </section>

      {/* ----------------------------------------- */}
      {/* PLEDGE MODAL */}
      {/* ----------------------------------------- */}

      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Make a Pledge
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedCampaign.title}
                </h3>
              </div>

              <button
                onClick={closePledgeForm}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <p className="mt-4 text-sm text-slate-600">
              Enter the amount you would like to
              pledge to this campaign.
            </p>

            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Pledge Amount (₹)
            </label>

            <input
              type="number"
              min="1"
              placeholder="1000"
              value={pledgeAmount}
              onChange={(e) =>
                setPledgeAmount(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
              {pledgeError && (
               <p className="mt-3 text-sm font-medium text-red-600">
                {pledgeError}
               </p>
              )}
            <div className="mt-6 flex gap-3">

              <button
                onClick={closePledgeForm}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePledge}
                disabled={
                  pledging ||
                  !pledgeAmount ||
                  Number(pledgeAmount) <= 0
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