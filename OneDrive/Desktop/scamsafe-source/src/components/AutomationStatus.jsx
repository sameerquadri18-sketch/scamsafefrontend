import React, { useState, useEffect } from 'react';
import { Activity, Calendar, MessageSquare, Video, TrendingUp } from 'lucide-react';
import { getAutomationStatus } from '../utils/api';

export default function AutomationStatus({ token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadStatus();
      const interval = setInterval(loadStatus, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadStatus = async () => {
    try {
      const data = await getAutomationStatus(token);
      setStatus(data);
      setError('');
    } catch (err) {
      setError('Failed to load automation status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Automation Status</h2>
        <button
          onClick={loadStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Queue */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Content Queue</h3>
            <Video className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">{status?.content_queue?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-bold text-yellow-600">{status?.content_queue?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Video Ready:</span>
              <span className="font-bold text-blue-600">{status?.content_queue?.video_ready || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Posted:</span>
              <span className="font-bold text-green-600">{status?.content_queue?.posted || 0}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users:</span>
              <span className="font-bold">{status?.whatsapp?.total_users || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Abandoned Sent:</span>
              <span className="font-bold text-orange-600">{status?.whatsapp?.abandoned_sent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Digest Sent:</span>
              <span className="font-bold text-blue-600">{status?.whatsapp?.digest_sent || 0}</span>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Posts:</span>
              <span className="font-bold">{status?.recent_posts?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upcoming:</span>
              <span className="font-bold">{status?.upcoming_content?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Content (Next 7 Days)</h3>
          </div>
        </div>
        <div className="p-6">
          {status?.upcoming_content?.length > 0 ? (
            <div className="space-y-3">
              {status.upcoming_content.map((content, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{content.theme || 'No theme'}</p>
                    <p className="text-sm text-gray-600">{new Date(content.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    content.status === 'posted' ? 'bg-green-100 text-green-800' :
                    content.status === 'video_ready' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {content.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming content scheduled</p>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
          </div>
        </div>
        <div className="p-6">
          {status?.recent_posts?.length > 0 ? (
            <div className="space-y-3">
              {status.recent_posts.map((post, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      post.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                      post.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                      post.platform === 'linkedin' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.platform}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.post_id || 'No ID'}</p>
                      <p className="text-xs text-gray-600">{new Date(post.posted_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    post.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent posts</p>
          )}
        </div>
      </div>
    </div>
  );
}
