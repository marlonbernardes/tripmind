export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Profile Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value="user@example.com"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>
        
        {/* Preferences Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dark Mode
                </label>
                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-1" />
              </button>
            </div>
            
          </div>
        </div>
        
        {/* Account Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
