'use client';

type MacWindowProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export default function MacWindow({ children, title = 'Safari', className = '' }: MacWindowProps) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 ${className}`}>
      {/* Window Header */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Traffic Lights */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
          </div>

          {/* Window Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-medium text-gray-600">{title}</span>
          </div>

          {/* Right Side Placeholder */}
          <div className="w-16"></div>
        </div>

        {/* Safari Toolbar */}
        <div className="mt-3 flex items-center space-x-2">
          {/* Back/Forward Buttons */}
          <div className="flex items-center space-x-1">
            <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex items-center space-x-2">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-500 truncate">hatchbeacon.com</span>
          </div>

          {/* Share Button */}
          <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="bg-gray-50">
        {children}
      </div>
    </div>
  );
}
