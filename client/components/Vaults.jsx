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
  loadingVaults
}) => (
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
          className={`transform transition-transform duration-300 ease-in-out ${isOpenVaultMenu ? 'rotate-180' : 'rotate-0'}`}
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
      {isOpenVaultMenu && vaults.map((vault) => (
        <SingleVault
          key={vault.id}
          vault={vault}
          selectedVaultId={selectedVaultId}
          setSelectedVaultId={setSelectedVaultId}
          handleDeleteVault={handleDeleteVault}
        />
      ))}
    </div>
  </div>
);

export default Vaults; 