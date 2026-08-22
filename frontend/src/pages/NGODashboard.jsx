import { useEffect, useState } from "react";

function NGODashboard() {
  const [campaigns, setCampaigns] = useState([]);

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  // Create campaign form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [target, setTarget] = useState("");

  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // -----------------------------------------
  // FETCH CAMPAIGNS
  // -----------------------------------------

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      setCampaignError("");

      const token = localStorage.getItem("clairToken");

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
          data.message || "Failed to load campaigns"
        );
      }

      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setCampaignError(error.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // -----------------------------------------
  // CREATE CAMPAIGN
  // -----------------------------------------

  const handleCreateCampaign = async (e) => {
    e.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    // Frontend validation
    if (!title.trim()) {
      setCreateError("Campaign title is required.");
      return;
    }

    if (!description.trim()) {
      setCreateError("Campaign description is required.");
      return;
    }

    if (!category.trim()) {
      setCreateError("Campaign category is required.");
      return;
    }

    if (!target || Number(target) <= 0) {
      setCreateError(
        "Target amount must be greater than 0."
      );
      return;
    }

    try {
      setCreatingCampaign(true);

      const token = localStorage.getItem("clairToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "http://localhost:5000/api/campaigns",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          // IMPORTANT:
          // These names exactly match campaignRoutes.js
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            target: Number(target),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create campaign"
        );
      }

      // Add newly created campaign immediately
      setCampaigns((previousCampaigns) => [
        data.campaign,
        ...previousCampaigns,
      ]);

      // Clear form
      setTitle("");
      setDescription("");
      setCategory("");
      setTarget("");

      setCreateSuccess(
        "Campaign created successfully!"
      );

      // Close form after successful creation
      setTimeout(() => {
        setShowCreateCampaign(false);
        setCreateSuccess("");
      }, 1200);
    } catch (error) {
      console.error(
        "Error creating campaign:",
        error
      );

      setCreateError(error.message);
    } finally {
      setCreatingCampaign(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              NGO Dashboard
            </h1>

            <p style={styles.subheading}>
              Manage your campaigns and track
              their progress.
            </p>
          </div>

          <button
            style={styles.createButton}
            onClick={() => {
              setShowCreateCampaign(
                !showCreateCampaign
              );

              setCreateError("");
              setCreateSuccess("");
            }}
          >
            {showCreateCampaign
              ? "Close"
              : "+ Create Campaign"}
          </button>
        </div>

        {/* CREATE CAMPAIGN FORM */}

        {showCreateCampaign && (
          <div style={styles.formCard}>
            <h2>
              Create New Campaign
            </h2>

            <p style={styles.formSubtitle}>
              Provide the details of the campaign
              you want to create.
            </p>

            <form
              onSubmit={handleCreateCampaign}
            >

              {/* TITLE */}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Campaign Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Education for 100 Children"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              {/* DESCRIPTION */}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  placeholder="Explain what this campaign is about..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  style={styles.textarea}
                  rows={5}
                />
              </div>

              {/* CATEGORY */}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Healthcare">
                    Healthcare
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                  <option value="Environment">
                    Environment
                  </option>

                  <option value="Community">
                    Community
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* TARGET */}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Target Amount (₹)
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="50000"
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              {/* ERROR */}

              {createError && (
                <div style={styles.errorBox}>
                  {createError}
                </div>
              )}

              {/* SUCCESS */}

              {createSuccess && (
                <div style={styles.successBox}>
                  {createSuccess}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                style={styles.submitButton}
                disabled={creatingCampaign}
              >
                {creatingCampaign
                  ? "Creating Campaign..."
                  : "Create Campaign"}
              </button>
            </form>
          </div>
        )}

        {/* CAMPAIGNS */}

        <div style={styles.campaignSection}>
          <div style={styles.sectionHeader}>
            <h2>Your Campaigns</h2>

            <button
              onClick={fetchCampaigns}
              style={styles.refreshButton}
            >
              Refresh
            </button>
          </div>

          {/* LOADING */}

          {loadingCampaigns && (
            <div style={styles.messageBox}>
              Loading campaigns...
            </div>
          )}

          {/* ERROR */}

          {campaignError && (
            <div style={styles.errorBox}>
              <p>{campaignError}</p>

              <button
                onClick={fetchCampaigns}
                style={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loadingCampaigns &&
            !campaignError &&
            campaigns.length === 0 && (
              <div style={styles.emptyBox}>
                <h3>
                  No campaigns yet
                </h3>

                <p>
                  Create your first campaign
                  to start receiving donations.
                </p>

                <button
                  onClick={() =>
                    setShowCreateCampaign(true)
                  }
                  style={styles.createButton}
                >
                  + Create Campaign
                </button>
              </div>
            )}

          {/* CAMPAIGN CARDS */}

          {!loadingCampaigns &&
            !campaignError &&
            campaigns.length > 0 && (
              <div style={styles.campaignGrid}>

                {campaigns.map((campaign) => {

  const targetAmount =
    Number(campaign.target) || 0;

  const raisedAmount =
    Number(campaign.raisedAmount) || 0;

  const percentage =
    targetAmount > 0
      ? Math.min(
          100,
          Math.round(
            (raisedAmount / targetAmount) * 100
          )
        )
      : 0;

  return (
    <div
      key={campaign.id}
      style={styles.campaignCard}
    >
                      <div
                        style={
                          styles.campaignHeader
                        }
                      >
                        <h3>
                          {campaign.title}
                        </h3>

                        <span
                          style={
                            styles.activeBadge
                          }
                        >
                          Active
                        </span>
                      </div>

                      <p
                        style={
                          styles.categoryText
                        }
                      >
                        {campaign.category}
                      </p>

                      <p
                        style={
                          styles.description
                        }
                      >
                        {campaign.description}
                      </p>

                      <div
                        style={
                          styles.amountRow
                        }
                      >
                        <span>
                          Raised
                        </span>

                        <strong>
                          ₹
                          {raisedAmount.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.amountRow
                        }
                      >
                        <span>
                          Target
                        </span>

                        <strong>
                          ₹
                          {targetAmount.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.progressBackground
                        }
                      >
                        <div
                          style={{
                            ...styles.progressBar,
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p
                        style={
                          styles.progressText
                        }
                      >
                        {percentage}% funded
                      </p>

                      {campaign.ngo && (
                        <p
                          style={
                            styles.ngoText
                          }
                        >
                          Created by:{" "}
                          {campaign.ngo.name}
                        </p>
                      )}

                      <p
                        style={
                          styles.pledgeText
                        }
                      >
                        Pledges:{" "}
                        {campaign._count
                          ?.pledges || 0}
                      </p>

                    </div>
                  );
                })}

              </div>
            )}
        </div>
      </div>
    </div>
  );
}


// -----------------------------------------
// STYLES
// -----------------------------------------

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },

  heading: {
    margin: 0,
    fontSize: "32px",
  },

  subheading: {
    color: "#666",
    marginTop: "8px",
  },

  createButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "15px",
    cursor: "pointer",
  },

  formCard: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "12px",
    marginBottom: "35px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  formSubtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "15px",
    backgroundColor: "white",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "15px",
    resize: "vertical",
  },

  submitButton: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "15px",
    cursor: "pointer",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px 15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  campaignSection: {
    marginTop: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  refreshButton: {
    padding: "8px 15px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    borderRadius: "7px",
    cursor: "pointer",
  },

  messageBox: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
  },

  retryButton: {
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  emptyBox: {
    backgroundColor: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
  },

  campaignGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  campaignCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.07)",
  },

  campaignHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "4px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  categoryText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "14px",
  },

  description: {
    color: "#555",
    lineHeight: "1.5",
  },

  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  progressBackground: {
    height: "10px",
    backgroundColor: "#e5e7eb",
    borderRadius: "10px",
    marginTop: "15px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: "10px",
  },

  progressText: {
    fontSize: "13px",
    color: "#666",
  },

  ngoText: {
    fontSize: "13px",
    color: "#666",
    marginTop: "15px",
  },

  pledgeText: {
    fontSize: "13px",
    color: "#666",
  },
};

export default NGODashboard;