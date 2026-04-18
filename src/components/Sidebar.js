import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'vision-test', icon: 'fas fa-eye', label: 'Vision Test' },
    { id: 'hearing-test', icon: 'fas fa-headphones', label: 'Hearing Test' },
    { id: 'analysis', icon: 'fas fa-chart-line', label: 'Analysis' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' }
  ];

  return (
    <div className="w-64 bg-white/95 backdrop-blur-lg shadow-2xl flex flex-col">
      {/* Logo */}
      <div className="p-8 text-center border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">ConcentraTrack</h3>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <i className={`${item.icon} text-lg w-5 mr-4`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-5 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
        >
          <i className="fas fa-sign-out-alt mr-3"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;