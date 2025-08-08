'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [content, setContent] = useState<any>(null);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testInProgress, setTestInProgress] = useState({
    directConnection: false,
    contentApi: false,
    testApi: false,
  });
  
  const [testResults, setTestResults] = useState({
    directConnection: { success: false, error: null as string | null },
    contentApi: { success: false, error: null as string | null },
    testApi: { success: false, error: null as string | null },
  });

  const testDirectConnection = async () => {
    setTestInProgress(prev => ({ ...prev, directConnection: true }));
    
    try {
      console.log('Testing direct Supabase connection...');
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Direct Supabase error:', error);
        setTestResults(prev => ({
          ...prev,
          directConnection: { success: false, error: error.message }
        }));
        return false;
      }

      console.log('Direct Supabase connection successful:', data);
      setTestResults(prev => ({
        ...prev,
        directConnection: { success: true, error: null }
      }));
      return true;
    } catch (err) {
      console.error('Direct connection test error:', err);
      setTestResults(prev => ({
        ...prev,
        directConnection: { 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        }
      }));
      return false;
    } finally {
      setTestInProgress(prev => ({ ...prev, directConnection: false }));
    }
  };

  const testContentApi = async () => {
    setTestInProgress(prev => ({ ...prev, contentApi: true }));
    
    try {
      console.log('Testing /api/content route...');
      const response = await fetch('/api/content');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      console.log('Content API response:', data);
      setContent(data);
      
      setTestResults(prev => ({
        ...prev,
        contentApi: { success: true, error: null }
      }));
      return true;
    } catch (err) {
      console.error('Content API test error:', err);
      setTestResults(prev => ({
        ...prev,
        contentApi: { 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        }
      }));
      return false;
    } finally {
      setTestInProgress(prev => ({ ...prev, contentApi: false }));
    }
  };

  const testTestApi = async () => {
    setTestInProgress(prev => ({ ...prev, testApi: true }));
    
    try {
      console.log('Testing /api/test route...');
      const response = await fetch('/api/test');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Test API error: ${response.status} ${response.statusText}`);
      }

      console.log('Test API response:', data);
      setApiTestResult(data);
      
      setTestResults(prev => ({
        ...prev,
        testApi: { success: data?.success === true, error: data?.error || null }
      }));
      return data?.success === true;
    } catch (err) {
      console.error('Test API error:', err);
      setTestResults(prev => ({
        ...prev,
        testApi: { 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        }
      }));
      return false;
    } finally {
      setTestInProgress(prev => ({ ...prev, testApi: false }));
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset test results
      setTestResults({
        directConnection: { success: false, error: null },
        contentApi: { success: false, error: null },
        testApi: { success: false, error: null },
      });
      
      // Run tests in sequence
      await testDirectConnection();
      await testContentApi();
      await testTestApi();
      
    } catch (err) {
      console.error('Test suite error:', err);
      setError(`Test suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const renderTestResult = (testName: string, result: { success: boolean; error: string | null }, inProgress: boolean) => {
    const isSuccess = result.success;
    const isLoading = inProgress;
    const hasError = !isLoading && !isSuccess;
    
    return (
      <div 
        key={testName}
        className={`p-4 rounded-lg mb-4 transition-colors ${
          isLoading ? 'bg-blue-50 border-l-4 border-blue-500' :
          isSuccess ? 'bg-green-50 border-l-4 border-green-500' :
          'bg-red-50 border-l-4 border-red-500'
        }`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            ) : isSuccess ? (
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium">
                {testName}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isLoading ? 'bg-blue-100 text-blue-800' :
                isSuccess ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {isLoading ? 'In Progress' : isSuccess ? 'Success' : 'Failed'}
              </span>
            </div>
            
            {hasError && result.error && (
              <div className="mt-1">
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const allTestsCompleted = !testInProgress.directConnection && 
    !testInProgress.contentApi && 
    !testInProgress.testApi;
    
  const allTestsPassed = allTestsCompleted && 
    testResults.directConnection.success && 
    testResults.contentApi.success && 
    testResults.testApi.success;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6">
          <h1 className="text-2xl font-bold">Supabase Connection Tests</h1>
          <p className="text-gray-300 mt-1">
            Verify the connection between your application and Supabase
          </p>
        </div>
        
        {/* Test Results */}
        <div className="p-6">
          {/* Status Banner */}
          {isLoading ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Running tests...
                  </p>
                </div>
              </div>
            </div>
          ) : allTestsPassed ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    All tests passed successfully!
                  </h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Some tests failed. Please check the details below.
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message if any */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Test Results */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
            
            {renderTestResult(
              'Direct Supabase Connection', 
              testResults.directConnection, 
              testInProgress.directConnection
            )}
            
            {renderTestResult(
              'Content API (/api/content)', 
              testResults.contentApi, 
              testInProgress.contentApi
            )}
            
            {renderTestResult(
              'Test API (/api/test)', 
              testResults.testApi, 
              testInProgress.testApi
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                'Run All Tests Again'
              )}
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Home
            </button>
          </div>
        </div>
        
        {/* API Response Data */}
        {(content || apiTestResult) && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Response Data</h2>
            
            {content && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Content API Response</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200 overflow-auto max-h-64">
                  <pre className="text-xs text-gray-800">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {apiTestResult && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Test API Response</h3>
                <div className="bg-white p-3 rounded-md border border-gray-200 overflow-auto max-h-64">
                  <pre className="text-xs text-gray-800">
                    {JSON.stringify(apiTestResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Environment Information */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Environment Information</h2>
          <div className="bg-white p-3 rounded-md border border-gray-200 overflow-auto">
            <pre className="text-xs text-gray-800">
              {JSON.stringify({
                nodeEnv: process.env.NODE_ENV,
                publicUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
                environment: process.env.VERCEL_ENV || 'development',
                buildTime: new Date().toISOString(),
                clientSide: {
                  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                  isServer: typeof window === 'undefined',
                  location: typeof window !== 'undefined' ? window.location.href : 'Server-side',
                },
                // Don't expose sensitive keys in the UI
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
