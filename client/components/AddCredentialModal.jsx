import React from "react";

const AddCredentialModal = ({
  show,
  onClose,
  onSubmit,
  newCredentialUsername,
  setNewCredentialUsername,
  newCredentialPassword,
  setNewCredentialPassword,
  newCredentialUrl,
  setNewCredentialUrl,
  vaultName
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Add new credential to <i>{vaultName}</i> vault
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="credUsername" className="text-slate-800 text-sm font-medium mb-2 block">
              Name
            </label>
            <input
              type="text"
              id="credUsername"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="e.g., myemail@example.com"
              value={newCredentialUsername}
              onChange={e => setNewCredentialUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="credPassword" className="text-slate-800 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              type="password"
              id="credPassword"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="Enter password"
              value={newCredentialPassword}
              onChange={e => setNewCredentialPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="credUrl" className="text-slate-800 text-sm font-medium mb-2 block">
              URL (Optional)
            </label>
            <input
              type="url"
              id="credUrl"
              className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="e.g., https://example.com"
              value={newCredentialUrl}
              onChange={e => setNewCredentialUrl(e.target.value)}
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
              Add Credential
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCredentialModal; 