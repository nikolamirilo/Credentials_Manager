import React, { useState } from "react";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { BiSolidEditAlt } from "react-icons/bi";

const SingleVault = ({ 
  vault, 
  selectedVaultId, 
  setSelectedVaultId, 
  handleDeleteVault, 
  onDropCredential,
  handleOpenEditVault
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const credentialId = e.dataTransfer.getData('credentialId');
    if (credentialId) {
      onDropCredential(credentialId, vault.id);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
        selectedVaultId === vault.id
          ? "bg-slate-100"
          : "hover:bg-slate-50"
      } ${isDragOver ? "border-2 border-blue-500" : ""}`}
      onClick={() => setSelectedVaultId(vault.id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-700">{vault.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditVault(vault);
          }}
          className="p-1 hover:bg-slate-200 rounded-full transition-colors"
        >
          <BiSolidEditAlt className="text-slate-600" size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteVault(vault.id);
          }}
          className="p-1 hover:bg-slate-200 rounded-full transition-colors"
        >
          <MdOutlineDeleteSweep className="text-red-400 hover:text-red-500" size={20}/>
        </button>
      </div>
    </div>
  );
};

export default SingleVault; 