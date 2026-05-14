import React from 'react';
import { useNavigate } from 'react-router-dom';

const WeddingCard = ({ wedding, onPublish, onArchive }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      ready: { color: 'bg-blue-100 text-blue-700', label: 'Ready' },
      published: { color: 'bg-green-100 text-green-700', label: 'Published' },
      archived: { color: 'bg-red-100 text-red-700', label: 'Archived' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {wedding.title || 'Untitled Wedding'}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {wedding.groom_name || 'Groom'} & {wedding.bride_name || 'Bride'}
          </p>
          <p className="text-sm text-gray-500">
            Event Date: {formatDate(wedding.event_date)}
          </p>
        </div>
        {getStatusBadge(wedding.status || 'draft')}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Slug</p>
            <p className="font-medium text-gray-900 truncate">
              {wedding.slug || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Design</p>
            <p className="font-medium text-gray-900 truncate">
              {wedding.selected_design_key || wedding.design_id || 'Not selected'}
            </p>
          </div>
        </div>
      </div>

      {(wedding.status === 'draft' || wedding.status === 'ready') && wedding.estimated_cost !== undefined && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700 font-medium">
              Estimated Cost:
            </span>
            <span className="text-lg font-bold text-purple-900">
              {wedding.estimated_cost} credits
            </span>
          </div>
        </div>
      )}

      {wedding.status === 'published' && wedding.total_credit_cost !== undefined && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">
              Credits Used:
            </span>
            <span className="text-lg font-bold text-green-900">
              {wedding.total_credit_cost} credits
            </span>
          </div>
          {wedding.published_at && (
            <p className="text-xs text-green-600 mt-1">
              Published on {formatDate(wedding.published_at)}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/admin/wedding/${wedding.id}/edit`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Edit
        </button>

        {wedding.status === 'ready' && (
          <button
            onClick={() => onPublish(wedding.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Publish
          </button>
        )}

        {wedding.status === 'published' && (
          <button
            onClick={() => navigate(`/invite/${wedding.slug}`)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            View Live
          </button>
        )}

        {(wedding.status === 'published' || wedding.status === 'ready') && (
          <button
            onClick={() => onArchive(wedding.id)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Archive
          </button>
        )}
      </div>

      {wedding.status === 'archived' && (
        <div className="mt-3 text-center text-sm text-gray-500">
          This wedding is archived and not publicly accessible
        </div>
      )}
    </div>
  );
};

export default WeddingCard;
