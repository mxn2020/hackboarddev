import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Moon, Sun, Monitor, Shield, Key, Eye, EyeOff, Save, Mail } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'system',
    notifications: true,
    emailNotifications: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: value,
    });
  };

  const saveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update theme in application
      if (generalSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (generalSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        // System theme detection would go here
      }
      
      setSuccessMessage('Settings saved successfully!');
    } catch (error) {
      setErrorMessage('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Destructure for validation purposes
    const { newPassword, confirmPassword } = securitySettings;

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Password changed successfully!');
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setErrorMessage('Failed to change password. Please check your current password and try again.');
      console.error('Error changing password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-center text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
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

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <form onSubmit={saveGeneralSettings} className="space-y-6">
              <div>
                <label className="text-base font-medium text-gray-900">Theme</label>
                <p className="text-sm text-gray-500 mb-3">Choose how the application appearance should be displayed</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="theme-system"
                      name="theme"
                      type="radio"
                      value="system"
                      checked={generalSettings.theme === 'system'}
                      onChange={handleGeneralChange}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="theme-system" className="ml-3 block text-sm font-medium text-gray-700 flex items-center">
                      <Monitor className="mr-2 h-5 w-5 text-gray-400" />
                      System Default
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-light"
                      name="theme"
                      type="radio"
                      value="light"
                      checked={generalSettings.theme === 'light'}
                      onChange={handleGeneralChange}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="theme-light" className="ml-3 block text-sm font-medium text-gray-700 flex items-center">
                      <Sun className="mr-2 h-5 w-5 text-gray-400" />
                      Light
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-dark"
                      name="theme"
                      type="radio"
                      value="dark"
                      checked={generalSettings.theme === 'dark'}
                      onChange={handleGeneralChange}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="theme-dark" className="ml-3 block text-sm font-medium text-gray-700 flex items-center">
                      <Moon className="mr-2 h-5 w-5 text-gray-400" />
                      Dark
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="text-base font-medium text-gray-900">Notifications</label>
                <p className="text-sm text-gray-500 mb-3">Manage how you receive notifications</p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        checked={generalSettings.notifications}
                        onChange={handleGeneralChange}
                        className="h-4 w-4 rounded text-blue-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifications" className="font-medium text-gray-700 flex items-center">
                        <Bell className="mr-2 h-5 w-5 text-gray-400" />
                        In-app notifications
                      </label>
                      <p className="text-gray-500">Receive notifications within the application</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        checked={generalSettings.emailNotifications}
                        onChange={handleGeneralChange}
                        className="h-4 w-4 rounded text-blue-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-gray-700 flex items-center">
                        <Mail className="mr-2 h-5 w-5 text-gray-400" />
                        Email notifications
                      </label>
                      <p className="text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={changePassword} className="space-y-6">
              <div>
                <label className="text-base font-medium text-gray-900 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-gray-400" />
                  Password Settings
                </label>
                <p className="text-sm text-gray-500 mb-3">Change your password</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={securitySettings.currentPassword}
                        onChange={handleSecurityChange}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={securitySettings.newPassword}
                        onChange={handleSecurityChange}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={securitySettings.confirmPassword}
                        onChange={handleSecurityChange}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
