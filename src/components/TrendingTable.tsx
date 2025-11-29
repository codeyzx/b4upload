import React from "react";
import { Eye, Heart, Loader2, BadgeCheck, Play } from "lucide-react";
import { TrendingVideo } from "../types";
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
                      <div className="relative flex-shrink-0 group cursor-pointer">
                        <a
                          href={video.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-80 transition-opacity relative"
                        >
                          {/* Loading placeholder - will be covered by iframe when loaded */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800">
                            <svg
                              className="w-8 h-8 text-gray-600 dark:text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                          </div>
                          {/* TikTok iframe embed */}
                          <div className="relative w-full h-full overflow-hidden">
                            <iframe
                              src={`https://www.tiktok.com/embed/v2/${video.tiktokUrl.split('/video/')[1]}`}
                              width="100%"
                              height="200%"
                              allow="autoplay"
                              loading="lazy"
                              className="w-full relative z-10"
                              style={{ 
                                pointerEvents: "none", 
                                border: "none",
                                overflow: "hidden",
                                marginTop: "-50px",
                                backgroundColor: "transparent"
                              }}
                              scrolling="no"
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors pointer-events-none z-20">
                            <Play size={20} className="text-white fill-white" />
                          </div>
                          <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded z-20">
                            {video.duration}
                          </div>
                        </a>
                      </div>
                      <div className="min-w-0 flex-1">
                        <a
                          href={video.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-relaxed hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                          {video.title}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Creator Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {video.creatorName}
                          </p>
                          {video.creatorVerified && (
                            <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
                              <BadgeCheck 
                                size={16} 
                                className="text-blue-500 dark:text-blue-400" 
                                fill="currentColor"
                                strokeWidth={0}
                              />
                              <svg
                                className="absolute w-2.5 h-2.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <a
                          href={video.tiktokProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 truncate block"
                        >
                          @{video.creatorUsername}
                        </a>
                        {video.followerCount > 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {video.followerCount.toLocaleString()} followers
                          </p>
                        )}
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
