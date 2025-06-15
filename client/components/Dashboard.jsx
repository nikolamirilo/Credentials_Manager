"use client"
import React, { useState, useEffect, use } from "react";
import { Menu, X, Shield, Plus, Upload, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation'
import Loader from "./Loader";
import { getData } from "../actions/server"
import { revalidateData } from "../helpers/server"
import Vaults from "./Vaults";
import Credentials from "./Credentials";
import { handleFileChange, handleDownloadSample } from "../helpers/dashboardHelpers";
import AddVaultModal from "./AddVaultModal";
import AddCredentialModal from "./AddCredentialModal";
import DecryptedPasswordModal from "./DecryptedPasswordModal";
import ImportCSVModal from "./ImportCSVModal";
import EditCredentialModal from "./EditCredentialModal";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import EditVaultModal from "./EditVaultModal";

const Dashboard = () => {
  const router = useRouter();
  // State for user and data
  const [userId, setUserId] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loadingVaults, setLoadingVaults] = useState(true);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
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
  // Edit credential modal state
  const [showEditCredentialModal, setShowEditCredentialModal] = useState(false);
  const [editCredentialId, setEditCredentialId] = useState(null);
  const [editCredentialUsername, setEditCredentialUsername] = useState("");
  const [editCredentialPassword, setEditCredentialPassword] = useState("");
  const [editCredentialUrl, setEditCredentialUrl] = useState("");
  const [editCredentialVaultId, setEditCredentialVaultId] = useState(null);

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

  // Add new state for edit vault modal
  const [showEditVaultModal, setShowEditVaultModal] = useState(false);
  const [editVaultId, setEditVaultId] = useState(null);
  const [editVaultName, setEditVaultName] = useState("");

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

  const handleAddVault = async (e) => {
    e.preventDefault();
    if (!newVaultName.trim()) {
      console.log("Vault name cannot be empty.");
      return;
    }
    if (!userId) {
      console.log("User not logged in.");
      return;
    }

    try {
      const response = await getData(`/vaults`, {
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

      // Refresh vaults list
      const updatedVaultsResponse = await getData(`/vaults?user_id=${userId}`);
      if (updatedVaultsResponse.ok) {
        setVaults(updatedVaultsResponse.data);
        // Set the newly created vault as selected
        if (updatedVaultsResponse.data.length > 0) {
          setSelectedVaultId(updatedVaultsResponse.data[updatedVaultsResponse.data.length - 1].id);
        }
      }
    } catch (err) {
      console.log(`Error adding vault: ${err.message}`);
    } finally {
      revalidateData();
    }
  };

  const handleDeleteVault = async (vaultId) => {
    if (!window.confirm("Are you sure you want to delete this vault? All credentials in this vault will be deleted.")) return;
    
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

      // Refresh vaults list
      const updatedVaultsResponse = await getData(`/vaults?user_id=${userId}`);
      if (updatedVaultsResponse.ok) {
        setVaults(updatedVaultsResponse.data);
        // Select the first vault if available
        if (updatedVaultsResponse.data.length > 0) {
          setSelectedVaultId(updatedVaultsResponse.data[0].id);
        } else {
          setSelectedVaultId(null);
          setCredentials([]);
        }
      }
    } catch (err) {
      console.log(`Error deleting vault: ${err.message}`);
    } finally {
      revalidateData();
    }
  };

  const handleAddCredential = async (e) => {
    e.preventDefault();
    if (!selectedVaultId) {
      console.log("Please select a vault first.");
      return;
    }
    if (!newCredentialUsername.trim() || !newCredentialPassword.trim()) {
      console.log("Username and password are required for credentials.");
      return;
    }

    try {
      const response = await getData(`/credentials`, {
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

      // Refresh credentials list
      const updatedCredentialsResponse = await getData(`/credentials/${selectedVaultId}`);
      if (updatedCredentialsResponse.ok) {
        setCredentials(updatedCredentialsResponse.data);
      }
    } catch (err) {
      console.log(`Error adding credential: ${err.message}`);
    } finally {
      revalidateData();
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
      revalidateData();
    }
  };

  // Handler to open edit modal with credential data
  const handleOpenEditCredential = (cred) => {
    setEditCredentialId(cred.id);
    setEditCredentialUsername(cred.username);
    setEditCredentialPassword(""); // Don't prefill password
    setEditCredentialUrl(cred.url || "");
    setEditCredentialVaultId(cred.vault_id);
    setShowEditCredentialModal(true);
  };

  // Handler to update credential
  const handleEditCredential = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!editCredentialId || !userId) {
      setMessage("Missing credential or user info.");
      return;
    }
    try {
      const body = {
        user_id: userId,
        username: editCredentialUsername,
        url: editCredentialUrl,
        vault_id: editCredentialVaultId,
      };
      if (editCredentialPassword) body.password = editCredentialPassword;
      
      const response = await getData(`/credentials/${editCredentialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = response.data;
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update credential");
      }
      setMessage("Credential updated successfully!");
      setShowEditCredentialModal(false);

      // Refresh credentials list for both source and target vaults
      if (editCredentialVaultId === selectedVaultId) {
        const updatedCredentialsResponse = await getData(`/credentials/${selectedVaultId}`);
        if (updatedCredentialsResponse.ok) {
          setCredentials(updatedCredentialsResponse.data);
        }
      } else {
        // If the credential was moved to a different vault, clear the current credentials
        setCredentials([]);
      }
    } catch (err) {
      setMessage(`Error updating credential: ${err.message}`);
    } finally {
      revalidateData();
    }
  };

  // Handler to delete credential
  const handleDeleteCredential = async (credId) => {
    if (!window.confirm("Are you sure you want to delete this credential?")) return;
    
    try {
      const response = await getData(`/credentials/${credId}?user_id=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(response.data.message || "Failed to delete credential");
      }
      setMessage("Credential deleted successfully!");

      // Refresh credentials list
      const updatedCredentialsResponse = await getData(`/credentials/${selectedVaultId}`);
      if (updatedCredentialsResponse.ok) {
        setCredentials(updatedCredentialsResponse.data);
      }
    } catch (err) {
      setMessage(`Error deleting credential: ${err.message}`);
    } finally {
      revalidateData();
    }
  };

  const handleDropCredential = async (credentialId, targetVaultId) => {
    try {
      const response = await getData(`/credentials/${credentialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          vault_id: targetVaultId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(response.data.message || "Failed to move credential");
      }
      
      setMessage("Credential moved successfully!");
      
      if (response.data) {
        if (selectedVaultId === credentials.find(c => c.id === credentialId)?.vault_id) {
          const updatedCredentialsResponse = await getData(`/credentials/${selectedVaultId}`);
          if (updatedCredentialsResponse.ok) {
            setCredentials(updatedCredentialsResponse.data);
          }
        }
        if (selectedVaultId === targetVaultId) {
          const updatedCredentialsResponse = await getData(`/credentials/${targetVaultId}`);
          if (updatedCredentialsResponse.ok) {
            setCredentials(updatedCredentialsResponse.data);
          }
        }
      }
    } catch (err) {
      setMessage(`Error moving credential: ${err.message}`);
    } finally {
      revalidateData();
    }
  };

   // Fetch vaults when userId changes
   useEffect(() => {
    const getDataVaults = async () => {
      if (!userId) return;

      setLoadingVaults(true);
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
        setLoadingVaults(false);
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

      setLoadingCredentials(true);
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
        setLoadingCredentials(false);
      }
    };

    getDataCredentials();
  }, [selectedVaultId]);

  // Add handler for opening edit vault modal
  const handleOpenEditVault = (vault) => {
    setEditVaultId(vault.id);
    setEditVaultName(vault.name);
    setShowEditVaultModal(true);
  };

  // Add handler for editing vault
  const handleEditVault = async (e) => {
    e.preventDefault();
    if (!editVaultId || !editVaultName.trim()) {
      setMessage("Missing vault information.");
      return;
    }

    try {
      const response = await getData(`/vaults/${editVaultId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: editVaultName,
        }),
      });

      if (!response.ok) {
        throw new Error(response.data.message || "Failed to update vault");
      }

      setMessage("Vault updated successfully!");
      setShowEditVaultModal(false);

      // Refresh vaults list
      const updatedVaultsResponse = await getData(`/vaults?user_id=${userId}`);
      if (updatedVaultsResponse.ok) {
        setVaults(updatedVaultsResponse.data);
      }
    } catch (err) {
      setMessage(`Error updating vault: ${err.message}`);
    } finally {
      revalidateData();
    }
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

  // Show Loader only if vaults are loading or (credentials are loading and vaults are loaded)
  if (loadingVaults || (loadingCredentials && vaults.length > 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-white/80">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-100">
      {/* Header */}
      <Header
        setShowAddVaultModal={setShowAddVaultModal}
        setShowAddCredentialModal={setShowAddCredentialModal}
        setShowImportCSVModal={setShowImportCSVModal}
        handleLogout={handleLogout}
        selectedVaultId={selectedVaultId}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      {/* Mobile Menu Dropdown */}
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setShowAddVaultModal={setShowAddVaultModal}
        setShowAddCredentialModal={setShowAddCredentialModal}
        setShowImportCSVModal={setShowImportCSVModal}
        handleLogout={handleLogout}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selectedVaultId={selectedVaultId}
      />

      <main className="flex-1 px-2 py-4 content-baseline md:px-6 md:py-6 grid lg:grid-cols-3 gap-4 md:gap-6 mt-[9vh] md:mt-[8vh] w-full max-w-[1500px] mx-auto">
        {/* Vaults Section */}
        <Vaults
          vaults={vaults}
          selectedVaultId={selectedVaultId}
          setSelectedVaultId={setSelectedVaultId}
          handleDeleteVault={handleDeleteVault}
          isOpenVaultMenu={isOpenVaultMenu}
          setIsOpenVaultMenu={setIsOpenVaultMenu}
          message={message}
          error={error}
          loadingVaults={loadingVaults}
          onDropCredential={handleDropCredential}
          handleOpenEditVault={handleOpenEditVault}
        />
        {/* Credentials Section */}
        <Credentials
          credentials={credentials}
          selectedVaultId={selectedVaultId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleShowPassword={handleShowPassword}
          handleOpenEditCredential={handleOpenEditCredential}
          handleDeleteCredential={handleDeleteCredential}
          loadingCredentials={loadingCredentials}
          error={error}
          vaults={vaults}
        />
      </main>

      {/* Add Vault Modal */}
      <AddVaultModal
        show={showAddVaultModal}
        onClose={() => setShowAddVaultModal(false)}
        onSubmit={handleAddVault}
        newVaultName={newVaultName}
        setNewVaultName={setNewVaultName}
      />
      {/* Add Credential Modal */}
      <AddCredentialModal
        show={showAddCredentialModal}
        onClose={() => setShowAddCredentialModal(false)}
        onSubmit={handleAddCredential}
        newCredentialUsername={newCredentialUsername}
        setNewCredentialUsername={setNewCredentialUsername}
        newCredentialPassword={newCredentialPassword}
        setNewCredentialPassword={setNewCredentialPassword}
        newCredentialUrl={newCredentialUrl}
        setNewCredentialUrl={setNewCredentialUrl}
        vaultName={vaults.find((v) => v.id === selectedVaultId)?.name || ""}
      />
      {/* Decrypted Password Modal */}
      <DecryptedPasswordModal
        show={showDecryptedPasswordModal}
        onClose={() => setShowDecryptedPasswordModal(false)}
        displayedPassword={displayedPassword}
        isCopied={isCopied}
        onCopy={() => {
          navigator.clipboard.writeText(displayedPassword);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }}
      />
      {/* Import CSV Modal */}
      <ImportCSVModal
        show={showImportCSVModal}
        onClose={() => setShowImportCSVModal(false)}
        handleFileChange={e => handleFileChange(e, setSelectedFile, setParsingError, setCsvData)}
        handleDownloadSample={handleDownloadSample}
        parsingError={parsingError}
        csvData={csvData}
        importing={importing}
        handleImportCSV={handleImportCSV}
        vaultName={vaults.find((v) => v.id === selectedVaultId)?.name || ""}
      />
      {/* Edit Credential Modal */}
      <EditCredentialModal
        show={showEditCredentialModal}
        onClose={() => setShowEditCredentialModal(false)}
        onSubmit={handleEditCredential}
        editCredentialUsername={editCredentialUsername}
        setEditCredentialUsername={setEditCredentialUsername}
        editCredentialPassword={editCredentialPassword}
        setEditCredentialPassword={setEditCredentialPassword}
        editCredentialUrl={editCredentialUrl}
        setEditCredentialUrl={setEditCredentialUrl}
        editCredentialVaultId={editCredentialVaultId}
        setEditCredentialVaultId={setEditCredentialVaultId}
        vaults={vaults}
      />
      {/* Edit Vault Modal */}
      <EditVaultModal
        show={showEditVaultModal}
        onClose={() => setShowEditVaultModal(false)}
        onSubmit={handleEditVault}
        editVaultName={editVaultName}
        setEditVaultName={setEditVaultName}
      />
    </div>
  );
};

export default Dashboard;
