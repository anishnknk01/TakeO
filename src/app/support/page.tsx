/**
 * PlayBite Support Page - Premium Design with Black Sidebar
 */
'use client';

import { useState } from 'react';
import PremiumSidebar from '@/components/navigation/PremiumSidebar';
import PremiumButton from '@/components/ui/PremiumButton';
import Link from 'next/link';

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          q: 'How do I set up PlayBite for my restaurant?',
          a: 'Setting up PlayBite is simple! First, create your restaurant account, then configure your games and rewards settings. Our setup wizard will guide you through each step.'
        },
        {
          q: 'What equipment do I need to run PlayBite?',
          a: 'You only need tablets or phones for customers to play games. We provide QR codes for easy check-in and all games run in the web browser.'
        },
        {
          q: 'How do customers earn points?',
          a: 'Customers earn points by playing interactive games during their visit. Points can be redeemed for rewards, discounts, and special offers you configure.'
        }
      ]
    },
    {
      id: 'games-rewards',
      title: 'Games & Rewards',
      icon: '🎮',
      questions: [
        {
          q: 'Can I customize the games available?',
          a: 'Yes! You can enable/disable specific games, set point values, and customize difficulty levels through your dashboard settings.'
        },
        {
          q: 'How do I create custom rewards?',
          a: 'Go to the Rewards section in your dashboard. You can create rewards with custom point costs, descriptions, and redemption rules.'
        },
        {
          q: 'What happens when customers redeem rewards?',
          a: 'When a reward is redeemed, you\'ll receive a notification and the customer gets a confirmation code to show your staff.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: '🔧',
      questions: [
        {
          q: 'The games are not loading properly',
          a: 'Check your internet connection and try refreshing the page. If issues persist, ensure your browser supports modern web standards and JavaScript is enabled.'
        },
        {
          q: 'How do I view analytics and reports?',
          a: 'Visit the Analytics section in your dashboard to view detailed reports on customer engagement, popular games, and reward redemptions.'
        },
        {
          q: 'Can I integrate PlayBite with my POS system?',
          a: 'Yes! We offer API integrations for popular POS systems. Contact our technical team for specific integration assistance.'
        }
      ]
    }
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: '💬',
      availability: 'Available 9 AM - 9 PM IST',
      action: 'Start Chat',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: '📧',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: '📞',
      availability: '+91 9876543210',
      action: 'Call Now',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Video Call',
      description: 'Schedule a screen sharing session',
      icon: '🎥',
      availability: 'By appointment only',
      action: 'Schedule Call',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Ticket submitted:', ticketForm);
    // Reset form
    setTicketForm({
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    });
    alert('Support ticket submitted successfully! We\'ll get back to you soon.');
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="support" />

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
                Support Center
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Get help and find answers to your questions
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="px-4 py-2 rounded-full text-sm font-medium shadow-lg" style={{
                background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(52,199,89,0.25)',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
              }}>
                🟢 All Systems Operational
              </div>
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

        {/* Support Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ 
              color: '#1D1D1F',
              fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
            }}>
              Get Help Quickly
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportChannels.map((channel) => (
                <div key={channel.title} className="rounded-3xl p-6 border hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">{channel.icon}</div>
                    <h3 className="font-semibold mb-2" style={{ 
                      color: '#1D1D1F',
                      fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
                    }}>
                      {channel.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#6E6E73' }}>{channel.description}</p>
                    <p className="text-xs mb-4" style={{ color: '#6E6E73' }}>{channel.availability}</p>
                    <PremiumButton size="sm" className="w-full">
                      {channel.action}
                    </PremiumButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              {/* FAQ Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.title}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-6">
                {faqCategories
                  .filter(category => selectedCategory === '' || category.id === selectedCategory)
                  .map((category) => (
                    <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {category.questions.map((faq, index) => (
                          <details key={index} className="group">
                            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="font-medium text-gray-900">{faq.q}</span>
                              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-3 p-3 text-gray-600 leading-relaxed">
                              {faq.a}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎫</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Submit a Ticket</h3>
                  <p className="text-sm text-gray-600">Can't find an answer? Contact us directly</p>
                </div>
              </div>

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="games">Games & Features</option>
                    <option value="account">Account Settings</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Submit Ticket
                </button>
              </form>

              {/* Additional Resources */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Additional Resources</h4>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <span>📚</span>
                    <span>Documentation & Guides</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <span>🎥</span>
                    <span>Video Tutorials</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <span>💬</span>
                    <span>Community Forum</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}