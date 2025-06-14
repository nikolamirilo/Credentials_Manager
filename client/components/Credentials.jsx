import React from "react";
import { X } from "lucide-react";
import SingleCredential from "./SingleCredential";

const Credentials = ({
  credentials,
  selectedVaultId,
  searchQuery,
  setSearchQuery,
  handleShowPassword,
  handleOpenEditCredential,
  handleDeleteCredential,
  loadingCredentials,
  error,
  vaults
}) => {
  const filteredCredentials = credentials.filter((cred) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      cred.username.toLowerCase().includes(searchLower) ||
      cred.url.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="lg:col-span-2 bg-white border max-h-[85vh] overflow-auto border-slate-300 rounded-lg p-2 md:p-6 shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          {selectedVaultId ? "Credentials" : "Select a Vault to view Credentials"}
        </h2>
        {selectedVaultId && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search credentials"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
      {error && selectedVaultId && (
        <p className="text-red-500">Error: {error}</p>
      )}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {selectedVaultId && filteredCredentials.length === 0 && !loadingCredentials && (
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
          <SingleCredential
            key={cred.id}
            cred={cred}
            handleShowPassword={handleShowPassword}
            handleOpenEditCredential={handleOpenEditCredential}
            handleDeleteCredential={handleDeleteCredential}
          />
        ))}
      </div>
    </div>
  );
};

export default Credentials; 