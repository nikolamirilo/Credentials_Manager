import React from 'react';

const DashboardHeader = ({ handleLogout }) => {
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-slate-800">Credentials Dashboard</h1>
            <button
                onClick={handleLogout}
                className="py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
                Logout
            </button>
        </header>
    );
};

export default DashboardHeader; 