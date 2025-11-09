import React from 'react';

interface TopUser {
  id: string;
  email: string;
  displayName?: string;
  promptCount: number;
}

interface TopUsersListProps {
  users: TopUser[];
  loading?: boolean;
  onUserClick?: (userId: string) => void;
}

const TopUsersList: React.FC<TopUsersListProps> = React.memo(({ users, loading = false, onUserClick }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No user data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <div
          key={user.id}
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            onUserClick 
              ? 'hover:bg-purple-50 cursor-pointer' 
              : 'bg-gray-50'
          }`}
          onClick={() => onUserClick && onUserClick(user.id)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || user.email}
              </p>
              {user.displayName && (
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600">{user.promptCount}</span>
              <span className="text-xs text-gray-500">prompts</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

TopUsersList.displayName = 'TopUsersList';

export default TopUsersList;
