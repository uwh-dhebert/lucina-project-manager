'use client';

export default function AIToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">AI Tools</h1>
        <p className="text-slate-400 mt-2">Generate design documents and get recommendations powered by AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Design Document Generator */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 p-8 hover:shadow-lg transition-all group cursor-not-allowed opacity-75">
          <div className="relative z-10">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">Design Document Generator</h2>
            <p className="text-slate-300 mb-6">
              Generate professional design documents using AI, based on Dan Hebert's template.
            </p>
            <button className="px-6 py-2 bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50" disabled>
              Coming Soon
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">✨</div>
        </div>

        {/* Story Recommender */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 p-8 hover:shadow-lg transition-all group cursor-not-allowed opacity-75">
          <div className="relative z-10">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-2">Story Recommender</h2>
            <p className="text-slate-300 mb-6">
              Get AI-powered story size recommendations for Azure DevOps with small-story bias.
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50" disabled>
              Coming Soon
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">📊</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-700 rounded-2xl p-8">
        <div className="flex gap-4">
          <div className="text-3xl">⚙️</div>
          <div>
            <h3 className="font-bold text-white mb-2">Setup Required</h3>
            <p className="text-slate-300 text-sm">
              These AI-powered tools are coming soon! To use them, you'll need to configure your API keys in settings:
            </p>
            <ul className="text-slate-300 text-sm mt-2 space-y-1 ml-4 list-disc">
              <li>xAI Grok API key for document generation</li>
              <li>Azure DevOps Personal Access Token for story recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

