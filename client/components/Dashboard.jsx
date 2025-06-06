"use client"
import React, { useState, useEffect, use } from "react";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { Menu, X, Shield, Plus, Upload, LogOut } from "lucide-react";
import { IoIosArrowUp } from "react-icons/io";
import { useRouter } from 'next/navigation'
import Loader from "./Loader";
import { getData } from "../actions/server"

const Dashboard = () => {
  const router = useRouter();
  // State for user and data
  const [userId, setUserId] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpenVaultMenu, setIsOpenVaultMenu] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");

  // State for modal visibility
  const [showAddVaultModal, setShowAddVaultModal] = useState(false);
  const [showAddCredentialModal, setShowAddCredentialModal] = useState(false);
  const [showDecryptedPasswordModal, setShowDecryptedPasswordModal] = useState(false);
  const [showImportCSVModal, setShowImportCSVModal] = useState(false);

  // States for form inputs
  const [newVaultName, setNewVaultName] = useState("");
  const [newCredentialUsername, setNewCredentialUsername] = useState("");
  const [newCredentialPassword, setNewCredentialPassword] = useState("");
  const [newCredentialUrl, setNewCredentialUrl] = useState("");
  const [displayedPassword, setDisplayedPassword] = useState("**********"); // Will show encrypted or placeholder

  // State for CSV import
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [parsingError, setParsingError] = useState(null);
  const [importing, setImporting] = useState(false);

  // Filter credentials based on search query
  const filteredCredentials = credentials.filter((cred) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      cred.username.toLowerCase().includes(searchLower) ||
      cred.url.toLowerCase().includes(searchLower)
    );
  });

  // Get user ID from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setMessage("No user logged in. Redirecting to login...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch vaults when userId changes
  useEffect(() => {
    const getDataVaults = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getData(`/vaults?user_id=${userId}`)
        const data = response.data;

        if (!response.ok) {
          throw new Error(data.message || "Failed to getData vaults");
        }
        setVaults(data);
        setSelectedVaultId(data[0].id);
      } catch (err) {
        setError(err.message);
        setMessage(`Error getDataing vaults: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getDataVaults();
  }, [userId]);

  // Fetch credentials when selectedVaultId changes
  useEffect(() => {
    const getDataCredentials = async () => {
      if (!selectedVaultId) {
        setCredentials([]); // Clear credentials if no vault is selected
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getData(
          `/credentials/${selectedVaultId}`
        ); // Ensure port matches
        const data = response.data;

        if (!response.ok) {
          throw new Error(data.message || "Failed to getData credentials");
        }
        setCredentials(data);
      } catch (err) {
        setError(err.message);
        setMessage(`Error getDataing credentials: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getDataCredentials();
  }, [selectedVaultId]);

  const handleAddVault = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!newVaultName.trim()) {
      setMessage("Vault name cannot be empty.");
      return;
    }
    if (!userId) {
      setMessage("User not logged in.");
      return;
    }

    try {
      const response = await getData(`/vaults`, {
        // Ensure port matches
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name: newVaultName }),
      });
      const data = response.data;

      if (!response.ok) {
        throw new Error(data.message || "Failed to create vault");
      }
      setMessage("Vault created successfully!");
      setNewVaultName("");
      setShowAddVaultModal(false);
      setIsMobileMenuOpen(false);
      // Re-getData vaults to update the list
      const updatedVaultsResponse = await getData(
        `/vaults?user_id=${userId}`
      );
      const updatedVaultsData = await updatedVaultsResponse.json();
      if (updatedVaultsResponse.ok) {
        setVaults(updatedVaultsData);
      }
    } catch (err) {
      setMessage(`Error adding vault: ${err.message}`);
    }
  };

  async function handleDeleteVault(vaultId) {
    console.log("Deleting vault with ID:", vaultId);
    try {
      const response = await getData(
        `/vaults/${vaultId}?user_id=${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete vault");
      }
      setMessage("Vault deleted successfully!");
      // Re-getData vaults to update the list
      const updatedVaultsResponse = await getData(
        `/vaults?user_id=${userId}`
      );
      if (updatedVaultsResponse.ok) {
        setVaults(updatedVaultsResponse.data);
      }
    } catch (err) {
      setMessage(`Error deleting vault: ${err.message}`);
    }
  }

  const handleAddCredential = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!selectedVaultId) {
      setMessage("Please select a vault first.");
      return;
    }
    if (!newCredentialUsername.trim() || !newCredentialPassword.trim()) {
      setMessage("Username and password are required for credentials.");
      return;
    }

    try {
      const response = await getData(`/credentials`, {
        // Ensure port matches
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vault_id: selectedVaultId,
          username: newCredentialUsername,
          password: newCredentialPassword,
          url: newCredentialUrl,
        }),
      });
      const data = response.data;

      if (!response.ok) {
        throw new Error(data.message || "Failed to add credential");
      }
      setMessage("Credential added successfully!");
      setNewCredentialUsername("");
      setIsMobileMenuOpen(false);
      setNewCredentialPassword("");
      setNewCredentialUrl("");
      setShowAddCredentialModal(false);
      // Re-getData credentials for the current vault
      const updatedCredentialsResponse = await getData(
        `/credentials/${selectedVaultId}`
      );
      const updatedCredentialsData = await updatedCredentialsResponse.json();
      if (updatedCredentialsResponse.ok) {
        setCredentials(updatedCredentialsData);
      }
    } catch (err) {
      setMessage(`Error adding credential: ${err.message}`);
    }
  };

  const handleShowPassword = async (encryptedPassword, iv) => {
    // As requested, no decryption logic here.
    // We will just display the encrypted password or a placeholder.
    // setDisplayedPassword(encryptedPassword); // Display the encrypted string
    setMessage(""); // Clear previous messages
    setDisplayedPassword("Decrypting..."); // Show a loading indicator

    try {
      const response = await getData(`/decrypt`, {
        // Ensure port matches
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedText: encryptedPassword, ivHex: iv }),
      });

      const data = response.data;

      if (!response.ok) {
        throw new Error(data.message || "Failed to decrypt password");
      }

      setDisplayedPassword(data.decryptedText); // Display the decrypted password
      setShowDecryptedPasswordModal(true);
    } catch (err) {
      setMessage(`Error decrypting password: ${err.message}`);
      setDisplayedPassword("Error"); // Indicate decryption failed
      setShowDecryptedPasswordModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    router.push("/"); // Redirect to login page using useNavigate
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setParsingError(null); // Clear previous errors

      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;
        try {
          // Basic CSV parsing: split by lines, then by commas.
          // Assumes simple CSV structure with no complex escaping.
          const lines = text.split("\n").filter((line) => line.trim() !== "");
          const parsedData = lines.map((line) =>
            line.split(",").map((cell) => cell.trim())
          );
          // Basic validation: check if there's at least a header row and data rows
          if (parsedData.length > 1) {
            setCsvData(parsedData);
          } else {
            setParsingError(
              "CSV should contain a header and at least one data row."
            );
            setCsvData(null);
          }
        } catch (parseErr) {
          setParsingError("Error parsing CSV file." + parseErr.message);
          setCsvData(null);
        }
      };

      reader.onerror = () => {
        setParsingError("Failed to read CSV file.");
        setSelectedFile(null);
        setCsvData(null);
      };

      reader.readAsText(file);
    } else {
      setSelectedFile(null);
      setCsvData(null);
      setParsingError(null);
    }
  };

  const handleImportCSV = async () => {
    if (!selectedVaultId) {
      setMessage("Please select a vault before importing credentials.");
      return;
    }
    if (!csvData || csvData.length <= 1) {
      setMessage("No valid data to import.");
      return;
    }

    setImporting(true);
    setMessage(""); // Clear previous messages
    setParsingError(null);

    // Assuming CSV columns are in order: username, password, url (optional)
    const credentialsToImport = csvData
      .slice(1)
      .map((row) => ({
        username: row[0],
        password: row[1],
        url: row[2] || null, // URL is optional
      }))
      .filter((cred) => cred.username && cred.password); // Only import rows with username and password

    if (credentialsToImport.length === 0) {
      setMessage("No valid credentials found in the CSV after parsing.");
      setImporting(false);
      return;
    }

    try {
      console.log("Simulating import of: ", credentialsToImport);

      const response = await getData(`/import-credentials`, {
        // New endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultId: selectedVaultId,
          credentials: credentialsToImport,
        }),
      });

      const data = response.data;

      if (!response.ok) {
        throw new Error(data.message || "Failed to import credentials");
      }
      setMessage(`Successfully imported ${data.importedCount} credentials.`);

      setCsvData(null);
      setSelectedFile(null);
      setIsMobileMenuOpen(false);
      setShowImportCSVModal(false);
      // Consider re-getDataing credentials for the current vault after a real import
      const updatedCredentialsResponse = await getData(
        `/credentials/${selectedVaultId}`
      );
      const updatedCredentialsData = await updatedCredentialsResponse.json();
      if (updatedCredentialsResponse.ok) {
        setCredentials(updatedCredentialsData);
      }
    } catch (err) {
      setMessage(`Error during import: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Function to handle sample CSV download
  const handleDownloadSample = () => {
    const sampleData = [
      ['username', 'password', 'url'],
      ['john.doe@example.com', 'password123', 'https://example.com'],
      ['jane.smith@company.com', 'securepass456', 'https://company.com']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_credentials.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!userId && !message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-slate-700">
          Loading user data or redirecting...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white/80">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
        <div className="px-4 py-4 flex justify-between items-center">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-slate-800">
              Secret Manager
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setShowAddVaultModal(true)}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Vault</span>
            </button>

            <button
              onClick={() => setShowAddCredentialModal(true)}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
              disabled={!selectedVaultId}
            >
              <Plus className="h-4 w-4" />
              <span>New Credential</span>
            </button>

            <button
              onClick={() => setShowImportCSVModal(true)}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-slate-600 border border-slate-300 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </button>

            <div className="w-px h-6 bg-slate-300"></div>

            <button
              onClick={() => handleLogout()}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100 focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
            <nav className="p-4 space-y-3">
              <button
                onClick={() => {
                  setShowAddVaultModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 py-3 px-4 text-sm font-medium rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Vault</span>
              </button>

              <button
                onClick={() => {
                  setShowAddCredentialModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 py-3 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedVaultId}
              >
                <Plus className="h-4 w-4" />
                <span>New Credential</span>
              </button>

              <button
                onClick={() => {
                  setShowImportCSVModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 py-3 px-4 text-sm font-medium rounded-lg text-slate-600 border border-slate-300 hover:bg-gray-50 focus:outline-none transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import from CSV</span>
              </button>

              <div className="border-t border-slate-200 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 py-3 px-4 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 px-2 py-4 content-baseline md:px-6 md:py-6 grid lg:grid-cols-3 gap-4 md:gap-6 mt-[9vh] md:mt-[8vh] w-full max-w-[1500px] mx-auto">
        {/* Vaults Section */}
        <div className="lg:col-span-1 sticky bg-white border h-fit border-slate-300 rounded-lg p-2 md:p-4 shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] flex flex-col">
          <div className="flex w-full justify-between p-2 items-center flex-row mb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              {isOpenVaultMenu ? "Your Vaults" : vaults.find(vault => vault.id === selectedVaultId)?.name}
            </h2>
            <button
              onClick={() => setIsOpenVaultMenu(!isOpenVaultMenu)}
              className="flex items-center justify-center p-0"
            >
              <IoIosArrowUp
                size={30}
                className={`transform transition-transform duration-300 ease-in-out ${isOpenVaultMenu ? 'rotate-180' : 'rotate-0'
                  }`}
              />
            </button>

          </div>
          {message && (
            <div
              className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          {error && <p className="text-red-500">Error: {error}</p>}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {vaults.length === 0 && !loading && (
              <p className="text-slate-500">No vaults found. Add one!</p>
            )}
            {isOpenVaultMenu && vaults.map((vault) => (
              <div
                key={vault.id}
                className={`p-4 border rounded-lg cursor-pointer relative transition duration-200 ease-in-out ${selectedVaultId === vault.id
                  ? "bg-blue-100 border-blue-500 shadow-md"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                onClick={() => setSelectedVaultId(vault.id)}
              >
                <h3 className="font-medium text-slate-800">{vault.name}</h3>
                <p className="text-sm text-slate-500">
                  Created: {new Date(vault.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVault(vault.id);
                  }}
                  className="z-100 absolute top-2 right-2 text-red-400 cursor-pointer hover:text-red-500"
                >
                  <MdOutlineDeleteSweep size={30} />
                </button>
              </div>
            ))}
          </div>
        </div>


        {/* Credentials Section */}
        <div className="lg:col-span-2 bg-white border max-h-[85vh] overflow-auto border-slate-300 rounded-lg p-2 md:p-6 shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {selectedVaultId
                ? "Credentials"
                : "Select a Vault to view Credentials"}
            </h2>
            {selectedVaultId && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search credentials"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {loading && selectedVaultId && (
            <p className="text-slate-500">Loading credentials...</p>
          )}
          {error && selectedVaultId && (
            <p className="text-red-500">Error: {error}</p>
          )}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedVaultId && filteredCredentials.length === 0 && !loading && (
              <p className="text-slate-500">
                {searchQuery
                  ? "No credentials match your search."
                  : "No credentials found in this vault. Add one!"}
              </p>
            )}
            {!selectedVaultId && (
              <p className="text-slate-500">
                Please select a vault from the left to view its credentials.
              </p>
            )}
            {filteredCredentials.sort((a, b) => a.url.localeCompare(b.url)).map((cred) => (
              <div
                key={cred.id}
                className="p-2 md:p-4 border relative border-gray-200 rounded-lg bg-white shadow-sm flex items-start gap-4 flex-row"
              >
                <img src={`https://logo.clearbit.com/${cred.url}`} alt={cred.url} width={50} height={50} className="rounded-full" />
                <div className="flex flex-start gap-1 flex-col">
                  <h3 className="font-medium text-slate-800">{cred.username}</h3>
                  <p className="text-sm text-slate-600">
                    URL:{" "}
                    <a
                      href={cred.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {cred.url || "N/A"}
                    </a>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-500 italic">
                      Password: Encrypted
                    </span>

                  </div>
                </div>
                <button
                  onClick={() =>
                    handleShowPassword(cred.password_encrypted, cred.iv)
                  } // Pass encrypted password and IV
                  className="text-blue-600 hover:underline text-sm font-medium absolute bottom-2 right-4"
                >
                  Show
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Vault Modal */}
      {showAddVaultModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Create New Vault
            </h3>
            <form onSubmit={handleAddVault} className="space-y-4">
              <div>
                <label
                  htmlFor="vaultName"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Vault Name
                </label>
                <input
                  type="text"
                  id="vaultName"
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="e.g., Personal, Work"
                  value={newVaultName}
                  onChange={(e) => setNewVaultName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddVaultModal(false)}
                  className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Create Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddCredentialModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Add new credential to <i>{vaults.find((v) => v.id === selectedVaultId)?.name || ""}</i> vault
            </h3>
            <form onSubmit={handleAddCredential} className="space-y-4">
              <div>
                <label
                  htmlFor="credUsername"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="credUsername"
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="e.g., myemail@example.com"
                  value={newCredentialUsername}
                  onChange={(e) => setNewCredentialUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="credPassword"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="credPassword"
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter password"
                  value={newCredentialPassword}
                  onChange={(e) => setNewCredentialPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="credUrl"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  URL (Optional)
                </label>
                <input
                  type="url"
                  id="credUrl"
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="e.g., https://example.com"
                  value={newCredentialUrl}
                  onChange={(e) => setNewCredentialUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCredentialModal(false)}
                  className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Add Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decrypted Password Modal */}
      {showDecryptedPasswordModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Decrypted Password
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg break-words">
              <p className="text-lg font-mono text-slate-800">
                {displayedPassword}
              </p>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(displayedPassword);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000); 
                }}
                className={`py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => setShowDecryptedPasswordModal(false)}
                className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportCSVModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Import Credentials from CSV
            </h3>
            <h4 className="mb-2">Destination vault: <i>{vaults.find((v) => v.id === selectedVaultId)?.name || ""}</i></h4>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                Your CSV file should have the following columns:
              </p>
              <ul className="text-sm text-slate-600 list-disc list-inside mb-3">
                <li>username (required)</li>
                <li>password (required)</li>
                <li>url (optional)</li>
              </ul>
              <button
                onClick={handleDownloadSample}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Sample CSV
              </button>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-4 mb-6 border border-dashed border-slate-400 rounded-lg p-2 cursor-pointer w-full"
            />

            {parsingError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span className="block sm:inline">Error: {parsingError}</span>
              </div>
            )}

            {csvData && !parsingError && (
              <div className="mb-4">
                <p className="text-green-700">
                  File read successfully. Ready to import {csvData.length - 1}{" "}
                  credentials.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowImportCSVModal(false)}
                className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none"
              >
                Cancel
              </button>
              {/* Import button will be added here after file is read */}
              <button
                type="button"
                onClick={() => handleImportCSV()}
                className={`py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${csvData && !importing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
                  } focus:outline-none`}
                disabled={!csvData || importing}
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
