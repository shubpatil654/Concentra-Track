import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import VisionTest from './VisionTest';
import HearingTest from './HearingTest';
import Analysis from './Analysis';
import Profile from './Profile';

const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'vision-test':
        return <VisionTest />;
      case 'hearing-test':
        return <HearingTest />;
      case 'analysis':
        return <Analysis />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 p-8 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default MainApp;