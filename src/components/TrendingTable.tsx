import React from "react";
import { Eye, Heart, Loader2 } from "lucide-react";
import { TrendingVideo } from "../types";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface TrendingTableProps {
  videos: TrendingVideo[];
  visibleCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const TrendingTable: React.FC<TrendingTableProps> = ({
  videos,
  visibleCount,
  onLoadMore,
  hasMore,
  isLoading = false,
}) => {
  const visibleVideos = videos.slice(0, visibleCount);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 border-[1.5px] border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[300px]">
                  Video
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Creator
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleVideos.map((video, index) => (
                <tr
                  key={video.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                >
                  {/* Rank */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>

                  {/* Thumbnail & Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-28 h-20 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 max-w-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-3 leading-relaxed">
                          {video.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default" size="sm">
                            {video.category}
                          </Badge>
                        </div>
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
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {video.creatorName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {video.creatorUsername}
                        </p>
                      </div>
                    </div>
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
                          ? "success"
                          : parseFloat(video.engagementRate) >= 10
                          ? "warning"
                          : "default"
                      }
                      size="md"
                    >
                      {video.engagementRate}
                    </Badge>
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
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Videos"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
