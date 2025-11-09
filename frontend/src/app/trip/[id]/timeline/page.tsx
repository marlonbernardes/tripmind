interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { id } = await params;
  
  return (
    <div className="flex h-screen">
      {/* Main Timeline Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Trip Timeline</h1>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Timeline</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded">Map</button>
            </div>
          </div>
          
          {/* Day Section */}
          <div className="mb-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-4">
              <h2 className="text-xl font-semibold">Monday, January 15 — Paris</h2>
            </div>
            
            {/* Activity Cards */}
            <div className="space-y-4 ml-4">
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  ✈️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Flight to Paris</h3>
                  <p className="text-gray-600 text-sm">08:00 - 10:30</p>
                  <p className="text-gray-500 text-xs mt-1">CDG Airport</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  🏨
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Hotel Check-in</h3>
                  <p className="text-gray-600 text-sm">15:00</p>
                  <p className="text-gray-500 text-xs mt-1">Hotel Louvre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
        <h3 className="font-semibold mb-4">Activity Details</h3>
        <p className="text-gray-600 text-sm">Select an activity to view details</p>
      </div>
    </div>
  );
}
