interface InfoModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({ onClose, title, children }: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-gray-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 