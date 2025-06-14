import React from "react";
import { MdOutlineDeleteSweep, MdEditSquare  } from "react-icons/md";
import {BiSolidEditAlt } from "react-icons/bi";

const SingleCredential = ({ cred, handleShowPassword, handleOpenEditCredential, handleDeleteCredential }) => (
  <div
    className="p-2 md:p-4 border relative border-gray-200 rounded-lg bg-white shadow-sm flex items-start gap-4 flex-row"
  >
    <img src={cred.url != null ? `https://logo.clearbit.com/${cred.url}` : 'https://t4.ftcdn.net/jpg/03/14/29/07/360_F_314290715_PDMAmK7Bbhw73Y57eT8sI57hrpddeaEu.jpg'} alt={cred.url} width={50} height={50} className="rounded-full" />
    <div className="flex flex-start gap-1 flex-col">
      <h3 className="font-medium text-slate-800">{cred.username}</h3>
      <p className="text-sm text-slate-600">
        URL: {" "}
        <a
          href={cred.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {cred.url || "N/A"}
        </a>
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-slate-500 italic">
          Password: Encrypted
        </span>
      </div>
    </div>
    <button
      onClick={() => handleShowPassword(cred.password_encrypted, cred.iv)}
      className="text-blue-600 hover:underline text-sm font-medium absolute bottom-2 right-4"
    >
      Show
    </button>
    <div className="absolute top-2 right-2 gap-2 flex flex-row justify-center items-center">
    <button
      onClick={() => handleDeleteCredential(cred.id)}
      className="text-red-400 cursor-pointer hover:text-red-500">
      <MdOutlineDeleteSweep size={25} />
    </button>
    <button
      onClick={() => handleOpenEditCredential(cred)}
      className="text-gray-700 hover:text-gray-800"
      title="Edit"
    >
      <BiSolidEditAlt   size={25}/>
    </button>
    </div>
  </div>
);

export default SingleCredential; 