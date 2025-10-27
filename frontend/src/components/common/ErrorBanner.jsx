import React from 'react';

function ErrorBanner({ error }) {
  if (!error) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error}
      </div>
    </div>
  );
}

export default ErrorBanner;