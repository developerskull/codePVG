export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Primary Card</h3>
            <p className="text-gray-600">
              This is a test card to verify Tailwind CSS is working properly.
            </p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Click Me
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Success Card</h3>
            <p className="text-gray-600">
              Another test card with different styling to check responsiveness.
            </p>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Success
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Purple Card</h3>
            <p className="text-gray-600">
              Third test card to verify grid layout and spacing.
            </p>
            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Purple
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-600 font-semibold">✅ Working</div>
            <div className="text-sm text-green-700">Tailwind CSS</div>
          </div>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-blue-600 font-semibold">🎨 Styled</div>
            <div className="text-sm text-blue-700">Components</div>
          </div>
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-purple-600 font-semibold">📱 Responsive</div>
            <div className="text-sm text-purple-700">Layout</div>
          </div>
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-orange-600 font-semibold">⚡ Fast</div>
            <div className="text-sm text-orange-700">Performance</div>
          </div>
        </div>

        {/* Color Palette Test */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-red-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Red</span>
            </div>
            <div className="bg-blue-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Blue</span>
            </div>
            <div className="bg-green-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Green</span>
            </div>
            <div className="bg-yellow-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Yellow</span>
            </div>
            <div className="bg-purple-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Purple</span>
            </div>
            <div className="bg-pink-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Pink</span>
            </div>
            <div className="bg-indigo-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Indigo</span>
            </div>
            <div className="bg-gray-500 h-16 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Gray</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
