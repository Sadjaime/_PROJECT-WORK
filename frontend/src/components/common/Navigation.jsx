import React from 'react';

function Navigation({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const tabs = ['dashboard', 'accounts', 'trading', 'stocks', 'transfers', 'profile'];

  return (
    <nav className={`bg-white border-b border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:space-x-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;