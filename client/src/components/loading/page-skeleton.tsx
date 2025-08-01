export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 animate-pulse">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-700 rounded"></div>
          <div className="h-8 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-700 rounded"></div>
                  <div className="h-6 w-20 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}