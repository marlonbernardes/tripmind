import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            🧭 Tripmind
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Plan your trips with a beautiful timeline, organize activities, manage documents, 
            and visualize your journey on a map. All offline-first and ready to sync.
          </p>
          
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/trips"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View My Trips
            </Link>
            <Link
              href="/settings"
              className="px-8 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
            >
              Settings
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Timeline Planning</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Organize activities by day with drag-and-drop timeline interface
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Trip Wallet</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Store documents, confirmations, and files for each trip
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Map View</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Visualize your activities and routes on an interactive map
            </p>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Offline-first • Auto-sync when online
          </div>
        </div>
      </div>
    </div>
  );
}
