/**
 * PlayBite Settings Page - Premium Design with Black Sidebar
 */
'use client';

import { useState } from 'react';
import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings  
    restaurantName: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Game Settings
    dailySpinLimit: 3,
    maxPointsPerGame: 500,
    gameSessionTimeout: 30,
    enableLeaderboard: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    allowMultipleSessions: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully! (Demo mode - not saved to database)');
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="settings" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <div className="border-b px-8 py-6" style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ 
                color: '#1D1D1F',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '700'
              }}>
                Settings
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Configure your PlayBite experience
              </p>
            </div>
            <div className="flex items-center gap-6">
              <PremiumButton onClick={handleSaveSettings}>
                Save Changes
              </PremiumButton>
              <div className="text-right">
                <p className="text-sm" style={{ 
                  color: '#6E6E73',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '400'
                }}>
                  Hi Restaurant Owner
                </p>
                <p className="font-medium" style={{ 
                  color: '#1D1D1F',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '500'
                }}>
                  Welcome back!
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 hover:scale-105" style={{
                background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                boxShadow: '0 8px 32px rgba(52,199,89,0.15)',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '600'
              }}>
                R
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* General Settings */}
            <div className="rounded-3xl p-6 border" style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                  boxShadow: '0 8px 32px rgba(0,122,255,0.25)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ 
                    color: '#1D1D1F',
                    fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
                  }}>
                    General Settings
                  </h3>
                  <p className="text-sm" style={{ color: '#6E6E73' }}>Basic restaurant and platform configuration</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => handleSettingChange('restaurantName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Mumbai">Asia/Mumbai (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎮</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Game Settings</h3>
                  <p className="text-sm text-gray-600">Configure game rules and limitations</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Spin Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.dailySpinLimit}
                    onChange={(e) => handleSettingChange('dailySpinLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum spins per customer per day</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Points Per Game</label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    step="50"
                    value={settings.maxPointsPerGame}
                    onChange={(e) => handleSettingChange('maxPointsPerGame', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum points earnable in a single game</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.gameSessionTimeout}
                    onChange={(e) => handleSettingChange('gameSessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Inactive session timeout</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Enable Leaderboard</p>
                    <p className="text-sm text-gray-600">Show public rankings to customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableLeaderboard}
                      onChange={(e) => handleSettingChange('enableLeaderboard', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Automated weekly analytics reports' },
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{notification.label}</p>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[notification.key as keyof typeof settings] as boolean}
                        onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-sm text-gray-600">Account security and access control</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Multiple Sessions</p>
                      <p className="text-sm text-gray-600">Allow login from multiple devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowMultipleSessions}
                        onChange={(e) => handleSettingChange('allowMultipleSessions', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Reset to Defaults
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}