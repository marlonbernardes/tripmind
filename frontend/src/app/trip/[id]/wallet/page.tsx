interface WalletPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Trip Wallet</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Upload File
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* File Card Example */}
        <div className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              📄
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Flight Confirmation</h3>
              <p className="text-gray-500 text-xs">PDF • 245 KB</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Jan 10, 2025</span>
            <button className="text-blue-600 hover:text-blue-700">View</button>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              🖼️
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Hotel Booking</h3>
              <p className="text-gray-500 text-xs">PNG • 156 KB</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Jan 12, 2025</span>
            <button className="text-blue-600 hover:text-blue-700">View</button>
          </div>
        </div>
        
        {/* Upload Area */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              ➕
            </div>
            <p className="text-sm text-gray-600 mb-1">Drop files here</p>
            <p className="text-xs text-gray-500">or click to upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
