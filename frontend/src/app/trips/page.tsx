export default function TripsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Trip
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Sample Trip</h3>
          <p className="text-gray-600 text-sm mb-4">Jan 15 - Jan 22, 2025</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">5 activities</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
