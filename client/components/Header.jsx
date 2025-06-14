import React from "react";
import { Menu, X, Shield, Plus, Upload, LogOut } from "lucide-react";

const Header = ({
  setShowAddVaultModal,
  setShowAddCredentialModal,
  setShowImportCSVModal,
  handleLogout,
  selectedVaultId,
  isMobileMenuOpen,
  toggleMobileMenu
}) => (
  <header className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
    <div className="px-4 py-4 flex justify-between items-center">
      {/* Logo/Title */}
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-slate-800">
          Secret Manager
        </h1>
      </div>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4">
        <button
          onClick={() => setShowAddVaultModal(true)}
          className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Vault</span>
        </button>
        <button
          onClick={() => setShowAddCredentialModal(true)}
          className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
          disabled={!selectedVaultId}
        >
          <Plus className="h-4 w-4" />
          <span>New Credential</span>
        </button>
        <button
          onClick={() => setShowImportCSVModal(true)}
          className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-slate-600 border border-slate-300 hover:bg-gray-50 focus:outline-none transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>Import CSV</span>
        </button>
        <div className="w-px h-6 bg-slate-300"></div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </nav>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100 focus:outline-none transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
    </div>
  </header>
);

export default Header; 