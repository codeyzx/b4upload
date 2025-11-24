import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
