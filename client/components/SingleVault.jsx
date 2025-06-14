import React from "react";
import { MdOutlineDeleteSweep } from "react-icons/md";

const SingleVault = ({ vault, selectedVaultId, setSelectedVaultId, handleDeleteVault }) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer relative transition duration-200 ease-in-out ${selectedVaultId === vault.id
      ? "bg-blue-100 border-blue-500 shadow-md"
      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
    onClick={() => setSelectedVaultId(vault.id)}
  >
    <h3 className="font-medium text-slate-800">{vault.name}</h3>
    <p className="text-sm text-slate-500">
      Created: {new Date(vault.created_at).toLocaleDateString()}
    </p>
    <button
      onClick={e => {
        e.stopPropagation();
        handleDeleteVault(vault.id);
      }}
      className="z-100 absolute top-2 right-2 text-red-400 cursor-pointer hover:text-red-500"
    >
      <MdOutlineDeleteSweep size={30} />
    </button>
  </div>
);

export default SingleVault; 