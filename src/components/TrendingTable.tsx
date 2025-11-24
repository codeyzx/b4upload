import React from 'react';
import { Eye, Heart, Save } from 'lucide-react';
import { TrendingVideo } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TrendingTableProps {
  videos: TrendingVideo[];
  visibleCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const TrendingTable: React.FC<TrendingTableProps> = ({
  videos,
  visibleCount,
  onLoadMore,
  hasMore,
}) => {
  const visibleVideos = videos.slice(0, visibleCount);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 border-[1.5px] border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Followers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleVideos.map((video, index) => (
                <tr
                  key={video.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                >
                  {/* Index */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </span>
                  </td>

                  {/* Thumbnail & Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Creator Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        src={video.creatorAvatar} 
                        alt={video.creatorName} 
                        size="md"
                        online
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-lg">{video.country}</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {video.creatorName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {video.creatorUsername}
                          </p>
                          <Badge variant="default" size="sm">
                            {video.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Followers */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatNumber(video.followerCount)}
                    </span>
                  </td>

                  {/* Publication Time */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {video.publicationTime}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <Eye size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {video.views}
                      </span>
                    </div>
                  </td>

                  {/* Likes */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <Heart size={14} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {video.likes}
                      </span>
                    </div>
                  </td>

                  {/* Engagement Rate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        parseFloat(video.engagementRate) >= 15 
                          ? 'success' 
                          : parseFloat(video.engagementRate) >= 10 
                          ? 'warning' 
                          : 'default'
                      }
                      size="md"
                    >
                      {video.engagementRate}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all duration-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all duration-200"
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
            >
              Load More Videos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
