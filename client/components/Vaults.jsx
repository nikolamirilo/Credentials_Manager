import React from "react";
import { IoIosArrowUp } from "react-icons/io";
import SingleVault from "./SingleVault";

const Vaults = ({
  vaults,
  selectedVaultId,
  setSelectedVaultId,
  handleDeleteVault,
  isOpenVaultMenu,
  setIsOpenVaultMenu,
  message,
  error,
  loadingVaults,
  onDropCredential,
  handleOpenEditVault
}) => {
  return (
    <div className="lg:col-span-1 sticky bg-white border h-fit border-slate-300 rounded-lg p-2 md:p-4 shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Vaults</h2>
        <button
          onClick={() => setIsOpenVaultMenu(!isOpenVaultMenu)}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors"
        >
          <IoIosArrowUp
            className={`text-slate-600 transition-transform ${
              isOpenVaultMenu ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>
      </div>
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {vaults.length === 0 && !loadingVaults && (
          <p className="text-slate-500">No vaults found. Add one!</p>
        )}
        {isOpenVaultMenu && vaults.sort((a, b) => a.name.localeCompare(b.name)).map((vault) => (
          <SingleVault
            key={vault.id}
            vault={vault}
            selectedVaultId={selectedVaultId}
            setSelectedVaultId={setSelectedVaultId}
            handleDeleteVault={handleDeleteVault}
            onDropCredential={onDropCredential}
            handleOpenEditVault={handleOpenEditVault}
          />
        ))}
      </div>
    </div>
  );
};

export default Vaults; 