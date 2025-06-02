import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User as UserIcon, Mail, Calendar, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user?.name, user?.email]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // For now, simulating an API update since we don't have the API implemented yet
    try {
      // Here we would make an API call to update the user profile
      // const response = await api.put('/user/profile', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user in the context
      updateUser({
        name: formData.name,
        email: formData.email
      });
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-center text-gray-600">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">View and edit your account information</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-start">
              <UserIcon className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Changing your email will require verification.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
