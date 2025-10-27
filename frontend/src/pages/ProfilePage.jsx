import React from 'react';
import { User, Edit2, Trash2 } from 'lucide-react';

function ProfilePage({ user, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {user.type}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onEdit}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-semibold text-gray-900">#{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Account Type</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {user.type}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Account Security</h4>
        <p className="text-blue-800 text-sm">
          Keep your account secure by using a strong password and never sharing your login credentials.
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;