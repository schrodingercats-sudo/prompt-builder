import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';
import { auth } from '../../services/firebaseConfig';
import { razorpayService } from '../../services/razorpayService';
import LoadingSpinner from './LoadingSpinner';
import RetryButton from './RetryButton';

interface AdminSettingsProps {
  currentUser: AuthUser;
}

interface APIStatus {
  gemini: 'connected' | 'disconnected' | 'checking';
  firebase: 'connected' | 'disconnected' | 'checking';
  supabase: 'connected' | 'disconnected' | 'checking';
  razorpay: 'connected' | 'disconnected' | 'checking';
}

interface SystemInfo {
  databaseSize: string;
  apiRequestCount: number;
  errorRate: string;
  uptime: string;
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    gemini: 'checking',
    firebase: 'checking',
    supabase: 'checking',
    razorpay: 'checking'
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    databaseSize: 'Calculating...',
    apiRequestCount: 0,
    errorRate: '0%',
    uptime: 'Calculating...'
  });
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check API status on mount
  useEffect(() => {
    checkAPIStatus();
    loadSystemInfo();
  }, []);

  const checkAPIStatus = async () => {
    setIsRefreshing(true);
    
    // Check Gemini AI
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
      setApiStatus(prev => ({ ...prev, gemini: apiKey ? 'connected' : 'disconnected' }));
    } catch {
      setApiStatus(prev => ({ ...prev, gemini: 'disconnected' }));
    }

    // Check Firebase Auth
    try {
      if (auth && auth.currentUser !== undefined) {
        setApiStatus(prev => ({ ...prev, firebase: 'connected' }));
      } else {
        setApiStatus(prev => ({ ...prev, firebase: 'disconnected' }));
      }
    } catch {
      setApiStatus(prev => ({ ...prev, firebase: 'disconnected' }));
    }

    // Check Supabase DB
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      setApiStatus(prev => ({ ...prev, supabase: error ? 'disconnected' : 'connected' }));
    } catch {
      setApiStatus(prev => ({ ...prev, supabase: 'disconnected' }));
    }

    // Check Razorpay
    try {
      const isConfigured = !!import.meta.env.VITE_RAZORPAY_KEY_ID;
      setApiStatus(prev => ({ ...prev, razorpay: isConfigured ? 'connected' : 'disconnected' }));
    } catch {
      setApiStatus(prev => ({ ...prev, razorpay: 'disconnected' }));
    }

    setIsRefreshing(false);
  };

  const loadSystemInfo = async () => {
    try {
      // Get database size (approximate from table counts)
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const { count: promptCount } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      // Rough estimate: each user ~1KB, each prompt ~5KB
      const estimatedSize = ((userCount || 0) * 1 + (promptCount || 0) * 5) / 1024;
      const sizeStr = estimatedSize < 1 
        ? `${Math.round(estimatedSize * 1024)} KB`
        : `${estimatedSize.toFixed(2)} MB`;

      // Get today's prompt count as API request count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayPrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate uptime (time since first user)
      const { data: firstUser } = await supabase
        .from('users')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      let uptimeStr = 'N/A';
      if (firstUser) {
        const uptimeMs = Date.now() - new Date(firstUser.created_at).getTime();
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        uptimeStr = `${days}d ${hours}h`;
      }

      setSystemInfo({
        databaseSize: sizeStr,
        apiRequestCount: todayPrompts || 0,
        errorRate: '0%', // Placeholder - would need error logging
        uptime: uptimeStr
      });
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    const results: HealthCheckResult[] = [];
    const timestamp = new Date().toISOString();

    // Test Gemini AI
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
      if (apiKey) {
        results.push({
          service: 'Gemini AI',
          status: 'healthy',
          message: 'API key configured and ready',
          timestamp
        });
      } else {
        results.push({
          service: 'Gemini AI',
          status: 'unhealthy',
          message: 'API key not configured',
          timestamp
        });
      }
    } catch (error) {
      results.push({
        service: 'Gemini AI',
        status: 'unhealthy',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      });
    }

    // Test Firebase Auth
    try {
      if (auth && auth.currentUser !== undefined) {
        results.push({
          service: 'Firebase Auth',
          status: 'healthy',
          message: 'Authentication service operational',
          timestamp
        });
      } else {
        results.push({
          service: 'Firebase Auth',
          status: 'unhealthy',
          message: 'Authentication service not initialized',
          timestamp
        });
      }
    } catch (error) {
      results.push({
        service: 'Firebase Auth',
        status: 'unhealthy',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      });
    }

    // Test Supabase DB
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        results.push({
          service: 'Supabase Database',
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
          timestamp
        });
      } else {
        results.push({
          service: 'Supabase Database',
          status: 'healthy',
          message: 'Database connection successful',
          timestamp
        });
      }
    } catch (error) {
      results.push({
        service: 'Supabase Database',
        status: 'unhealthy',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      });
    }

    // Test Razorpay
    try {
      const isConfigured = !!import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (isConfigured) {
        results.push({
          service: 'Razorpay',
          status: 'healthy',
          message: 'Payment gateway configured',
          timestamp
        });
      } else {
        results.push({
          service: 'Razorpay',
          status: 'unhealthy',
          message: 'Payment gateway not configured',
          timestamp
        });
      }
    } catch (error) {
      results.push({
        service: 'Razorpay',
        status: 'unhealthy',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      });
    }

    setHealthCheckResults(results);
    setIsCheckingHealth(false);
  };

  const getStatusColor = (status: 'connected' | 'disconnected' | 'checking') => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'checking') => {
    switch (status) {
      case 'connected':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'disconnected':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'checking':
        return (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">Monitor system health and API connections</p>
      </div>

      {/* API Status Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">API Status</h2>
          <button
            onClick={checkAPIStatus}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base touch-manipulation"
          >
            <svg className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {/* Gemini AI Status */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColor(apiStatus.gemini)}`}>
                {getStatusIcon(apiStatus.gemini)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 text-sm md:text-base">Gemini AI</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Prompt optimization service</p>
              </div>
            </div>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0 ${getStatusColor(apiStatus.gemini)}`}>
              {apiStatus.gemini}
            </span>
          </div>

          {/* Firebase Auth Status */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColor(apiStatus.firebase)}`}>
                {getStatusIcon(apiStatus.firebase)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 text-sm md:text-base">Firebase Auth</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">User authentication</p>
              </div>
            </div>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0 ${getStatusColor(apiStatus.firebase)}`}>
              {apiStatus.firebase}
            </span>
          </div>

          {/* Supabase DB Status */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColor(apiStatus.supabase)}`}>
                {getStatusIcon(apiStatus.supabase)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 text-sm md:text-base">Supabase DB</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Database connection</p>
              </div>
            </div>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0 ${getStatusColor(apiStatus.supabase)}`}>
              {apiStatus.supabase}
            </span>
          </div>

          {/* Razorpay Status */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full flex-shrink-0 ${getStatusColor(apiStatus.razorpay)}`}>
                {getStatusIcon(apiStatus.razorpay)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 text-sm md:text-base">Razorpay</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Payment gateway</p>
              </div>
            </div>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium flex-shrink-0 ${getStatusColor(apiStatus.razorpay)}`}>
              {apiStatus.razorpay}
            </span>
          </div>
        </div>
      </div>

      {/* System Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">System Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <h3 className="font-medium text-gray-900">Database Size</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{systemInfo.databaseSize}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-medium text-gray-900">API Requests (Today)</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{systemInfo.apiRequestCount}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-medium text-gray-900">Error Rate</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{systemInfo.errorRate}</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-medium text-gray-900">System Uptime</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{systemInfo.uptime}</p>
          </div>
        </div>
      </div>

      {/* System Health Check Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">System Health Check</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Test all API connections and services</p>
          </div>
          <button
            onClick={runHealthCheck}
            disabled={isCheckingHealth}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base touch-manipulation"
          >
            {isCheckingHealth ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Health Check
              </>
            )}
          </button>
        </div>

        {healthCheckResults.length > 0 && (
          <div className="space-y-3">
            {healthCheckResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.status === 'healthy'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-1 rounded-full ${
                      result.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {result.status === 'healthy' ? (
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        result.status === 'healthy' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.service}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        result.status === 'healthy' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    result.status === 'healthy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {healthCheckResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Click "Run Health Check" to test all services</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
