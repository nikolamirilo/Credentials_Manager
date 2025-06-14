import React from "react";

const ImportCSVModal = ({
  show,
  onClose,
  handleFileChange,
  handleDownloadSample,
  parsingError,
  csvData,
  importing,
  handleImportCSV,
  vaultName
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Import Credentials from CSV
        </h3>
        <h4 className="mb-2">Destination vault: <i>{vaultName}</i></h4>
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Error: {parsingError}</span>
          </div>
        )}
        {csvData && !parsingError && (
          <div className="mb-4">
            <p className="text-green-700">
              File read successfully. Ready to import {csvData.length - 1} credentials.
            </p>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-slate-700 border border-slate-300 hover:bg-gray-100 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportCSV}
            className={`py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${csvData && !importing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"} focus:outline-none`}
            disabled={!csvData || importing}
          >
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal; 