import React from "react";

const AddVaultModal = ({ show, onClose, onSubmit, newVaultName, setNewVaultName }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Create New Vault
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={e => setNewVaultName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
  );
};

export default AddVaultModal; 