import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

function VendorDashboard() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [success, setSuccess] = useState("");

  const [documentType, setDocumentType] =
    useState("INVOICE");

  const [documentFile, setDocumentFile] =
    useState(null);

  const [uploadingDocumentId, setUploadingDocumentId] =
    useState(null);

  // =====================================================
  // WALLET STATE
  // =====================================================

  const [walletAddress, setWalletAddress] = useState("");
  const [connectingWallet, setConnectingWallet] =
    useState(false);

  // =====================================================
  // FETCH PROCUREMENTS
  // =====================================================

  useEffect(() => {
    fetchProcurements();
    fetchWallet();
  }, []);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/vendors/procurements",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load procurements"
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

      setError(error.message);

    } finally {
      setLoading(false);
    }
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

      const response = await fetch(
        "http://localhost:5000/api/vendors/wallet",
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load wallet"
        );
      }

      setWalletAddress(
        data.walletAddress || ""
      );

    } catch (error) {
      console.error(
        "Fetch wallet error:",
        error
      );
    }
  };

  // =====================================================
  // CONNECT VENDOR WALLET
  // =====================================================

  const handleConnectWallet = async () => {
    try {
      setConnectingWallet(true);
      setError("");
      setSuccess("");

      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask."
        );
      }

      // -------------------------------------------------
      // Connect MetaMask
      // -------------------------------------------------

      const provider =
        new BrowserProvider(
          window.ethereum
        );

      await provider.send(
        "eth_requestAccounts",
        []
      );

      // -------------------------------------------------
      // Verify Sepolia
      // -------------------------------------------------

      const network =
        await provider.getNetwork();

      if (
        network.chainId !==
        11155111n
      ) {
        throw new Error(
          "Please switch MetaMask to the Sepolia network."
        );
      }

      // -------------------------------------------------
      // Get wallet
      // -------------------------------------------------

      const signer =
        await provider.getSigner();

      const address =
        await signer.getAddress();

      // -------------------------------------------------
      // Save wallet in backend
      // -------------------------------------------------

      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response =
        await fetch(
          "http://localhost:5000/api/vendors/wallet",
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
                address,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save wallet address"
        );
      }

      setWalletAddress(
        data.vendor?.walletAddress ||
          address
      );

      setSuccess(
        "MetaMask wallet connected successfully!"
      );

    } catch (error) {
      console.error(
        "Wallet connection error:",
        error
      );

      setError(error.message);

    } finally {
      setConnectingWallet(false);
    }
  };

  // =====================================================
  // ACCEPT PROCUREMENT
  // =====================================================

  const handleAccept = async (
    procurementId
  ) => {
    try {
      setAcceptingId(procurementId);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/vendors/procurements/${procurementId}/accept`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to accept procurement"
        );
      }

      setSuccess(
        "Procurement accepted successfully!"
      );

      await fetchProcurements();
    } catch (error) {
      console.error(
        "Accept procurement error:",
        error
      );

      setError(error.message);

    } finally {
      setAcceptingId(null);
    }
  };

  // =====================================================
  // MARK PROCUREMENT AS DELIVERED
  // =====================================================

  const handleDeliver = async (
    procurementId
  ) => {
    try {
      setDeliveringId(procurementId);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("clairToken");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/vendors/procurements/${procurementId}/deliver`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark procurement as delivered"
        );
      }

      setSuccess(
        "Procurement marked as delivered!"
      );

      await fetchProcurements();

    } catch (error) {
      console.error(
        "Delivery error:",
        error
      );

      setError(error.message);

    } finally {
      setDeliveringId(null);
    }
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleUploadDocument = async (procurementId) => {
    try {
      setUploadingDocumentId(procurementId);
      setError("");
      setSuccess("");

      if (!documentFile) {
        throw new Error(
          "Please select a PDF, JPG or PNG document."
        );
      }

      const token = localStorage.getItem("clairToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(documentFile.type)) {
        throw new Error(
          "Only PDF, JPG, JPEG and PNG files are allowed."
        );
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024;

      if (documentFile.size > maxSize) {
        throw new Error(
          "File size must be 10 MB or less."
        );
      }

      // Create multipart form data
      const formData = new FormData();

      formData.append("procurementId", procurementId);
      formData.append("type", documentType);
      formData.append("document", documentFile);

      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload document"
        );
      }

      setSuccess(
        "Document submitted successfully!"
      );

      setDocumentFile(null);

        const fileInput = document.getElementById(
        "vendor-document-file"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchProcurements();

    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      setError(error.message);

    } finally {
      setUploadingDocumentId(null);
    }
  };

   
  // =====================================================
  // STATISTICS
  // =====================================================

  const assignedOrders = procurements.length;

  const pendingDelivery = procurements.filter(
    (procurement) => procurement.status === "ORDERED"
  ).length;

  const verificationPending = procurements.filter(
    (procurement) =>
      procurement.status === "VERIFICATION_PENDING"
  ).length;

  const totalAmount = procurements.reduce(
    (total, procurement) =>
      total + Number(procurement.amount || 0),
    0
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Vendor Portal
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Vendor Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage assigned procurements, submit proof and
            track payments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleConnectWallet}
            disabled={connectingWallet}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connectingWallet
              ? "Connecting..."
              : walletAddress
              ? "Wallet Connected"
              : "Connect MetaMask"}
          </button>

          <button
            onClick={fetchProcurements}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* WALLET INFORMATION */}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-800">
          Blockchain Wallet
        </p>

        {walletAddress ? (
          <div className="mt-2">
            <p className="text-xs text-slate-500">
              Your vendor payment wallet:
            </p>

            <p className="mt-1 break-all font-mono text-sm text-slate-700">
              {walletAddress}
            </p>

            <p className="mt-2 text-xs text-green-600">
              ✓ Connected to Sepolia
            </p>
          </div>
        ) : (
          <div>
            <p className="mt-1 text-sm text-slate-500">
              Connect your MetaMask wallet so blockchain
              milestone payments can be sent to you.
            </p>

            <button
              onClick={handleConnectWallet}
              disabled={connectingWallet}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {connectingWallet
                ? "Connecting..."
                : "Connect Wallet"}
            </button>
          </div>
        )}
      </section>

      {/* SUCCESS */}

      {success && (
        <div className="mt-6 rounded-lg bg-green-100 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-lg bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Assigned Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {assignedOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Pending Delivery
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pendingDelivery}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Verification Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {verificationPending}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Assigned Value
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      {/* PROCUREMENT LIST */}

      <section className="mt-10">
        <h3 className="text-xl font-bold text-slate-900">
          Assigned Procurements
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Procurements assigned specifically to your
          vendor account.
        </p>

        {/* LOADING */}

        {loading && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">
              Loading procurements...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          procurements.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h4 className="font-semibold text-slate-800">
                No procurements assigned
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                New procurements assigned to your vendor
                account will appear here.
              </p>
            </div>
          )}

        {/* PROCUREMENT CARDS */}

        {!loading && procurements.length > 0 && (
          <div className="mt-5 space-y-4">
            {procurements.map((procurement) => (
              <div
                key={procurement.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  {/* LEFT */}

                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900">
                        Procurement #{procurement.id}
                      </h4>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          procurement.status === "CREATED"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {procurement.status}
                      </span>
                    </div>

                    <h5 className="mt-3 font-medium text-slate-800">
                      {procurement.campaign?.title ||
                        "Campaign"}
                    </h5>

                    <p className="mt-1 text-sm text-slate-500">
                      NGO:{" "}
                      {procurement.ngo?.name ||
                        "Unknown NGO"}
                    </p>

                    <p className="mt-3 text-sm text-slate-600">
                      {procurement.description}
                    </p>
                  </div>

                  {/* RIGHT */}

                  <div className="md:text-right">
                    <p className="text-lg font-bold text-slate-900">
                      ₹
                      {Number(
                        procurement.amount
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Procurement amount
                    </p>

                    {/* ACCEPT */}

                    {procurement.status === "CREATED" && (
                      <button
                        onClick={() =>
                          handleAccept(procurement.id)
                        }
                        disabled={
                          acceptingId === procurement.id
                        }
                        className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {acceptingId === procurement.id
                          ? "Accepting..."
                          : "Accept Procurement"}
                      </button>
                    )}

                    {/* DELIVER */}

                    {procurement.status === "ORDERED" && (
                      <button
                        onClick={() =>
                          handleDeliver(procurement.id)
                        }
                        disabled={
                          deliveringId === procurement.id
                        }
                        className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deliveringId === procurement.id
                          ? "Marking Delivered..."
                          : "Mark as Delivered"}
                      </button>
                    )}

                    {/* DOCUMENT SUBMISSION */}

                    {procurement.status === "DELIVERED" && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <p className="font-semibold text-slate-800">
                          Submit Documents
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Submit an invoice, receipt or
                          other supporting document.
                        </p>

                        {/* DOCUMENT TYPE */}

                        <select
                          value={documentType}
                          onChange={(e) =>
                            setDocumentType(e.target.value)
                          }
                          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="INVOICE">
                            Invoice
                          </option>

                          <option value="DELIVERY_RECEIPT">
                            Delivery Receipt
                          </option>

                          <option value="IMAGE">
                            Delivery Image
                          </option>
                        </select>

                        {/* FILE PICKER */}

                        <input
                          id="vendor-document-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          onChange={(e) =>
                            setDocumentFile(
                              e.target.files?.[0] || null
                            )
                          }
                          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />

                        {/* SELECTED FILE */}

                        {documentFile && (
                          <p className="mt-2 text-xs text-slate-500">
                            Selected: {documentFile.name}
                          </p>
                        )}

                        {/* SUBMIT */}

                        <button
                          onClick={() =>
                            handleUploadDocument(
                              procurement.id
                            )
                          }
                          disabled={
                            uploadingDocumentId ===
                            procurement.id
                          }
                          className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {uploadingDocumentId ===
                          procurement.id
                            ? "Uploading..."
                            : "Upload Document"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DELIVERY INFORMATION */}

      <section className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6">
        <h3 className="text-lg font-bold text-slate-900">
          Delivery & Verification
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          After completing a procurement, submit your
          invoice, delivery receipt and supporting images.
          CLAIR&apos;s verification system will analyze
          the submitted documents before escrowed funds
          are released.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Invoice
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Delivery Receipt
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Images
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            AI Verification
          </span>
        </div>
      </section>
    </main>
  );
}

export default VendorDashboard;