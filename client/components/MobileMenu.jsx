import React from "react";
import { X, Plus, Upload, LogOut } from "lucide-react";

const MobileMenu = ({
  isMobileMenuOpen,
  setShowAddVaultModal,
  setShowAddCredentialModal,
  setShowImportCSVModal,
  handleLogout,
  setIsMobileMenuOpen,
  selectedVaultId
}) => {
  if (!isMobileMenuOpen) return null;
  return (
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
  );
};

export default MobileMenu; 