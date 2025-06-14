import React from "react";

const EditCredentialModal = ({
  show,
  onClose,
  onSubmit,
  editCredentialUsername,
  setEditCredentialUsername,
  editCredentialPassword,
  setEditCredentialPassword,
  editCredentialUrl,
  setEditCredentialUrl,
  editCredentialVaultId,
  setEditCredentialVaultId,
  vaults
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Edit Credential
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="editCredUsername" className="text-slate-800 text-sm font-medium mb-2 block">
              Username
            </label>
            <input
              type="text"
              id="editCredUsername"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              value={editCredentialUsername}
              onChange={e => setEditCredentialUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="editCredPassword" className="text-slate-800 text-sm font-medium mb-2 block">
              Password (leave blank to keep unchanged)
            </label>
            <input
              type="password"
              id="editCredPassword"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              value={editCredentialPassword}
              onChange={e => setEditCredentialPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="editCredUrl" className="text-slate-800 text-sm font-medium mb-2 block">
              URL (Optional)
            </label>
            <input
              type="url"
              id="editCredUrl"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              value={editCredentialUrl}
              onChange={e => setEditCredentialUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editCredVault" className="text-slate-800 text-sm font-medium mb-2 block">
              Move to Vault
            </label>
            <select
              id="editCredVault"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              value={editCredentialVaultId || ''}
              onChange={e => setEditCredentialVaultId(e.target.value)}
              required
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>{vault.name}</option>
              ))}
            </select>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCredentialModal; 