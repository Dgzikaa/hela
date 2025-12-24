export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Você está offline
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all shadow-lg hover:shadow-xl"
        >
          Tentar Novamente
        </button>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Dica:</strong> Algumas funcionalidades podem estar disponíveis offline graças ao cache do aplicativo.
          </p>
        </div>
      </div>
    </div>
  )
}

