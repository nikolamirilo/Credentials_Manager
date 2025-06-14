import React from "react";

const DecryptedPasswordModal = ({ show, onClose, displayedPassword, isCopied, onCopy }) => {
  if (!show) return null;
  return (
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
            onClick={onCopy}
            className={`py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecryptedPasswordModal; 