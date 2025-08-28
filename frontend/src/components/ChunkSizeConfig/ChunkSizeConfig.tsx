import React, { useState } from 'react';

interface ChunkSizeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (chunkSize: number) => void;
  defaultChunkSize?: number;
}

const ChunkSizeConfig: React.FC<ChunkSizeConfigProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultChunkSize = 1000
}) => {
  const [chunkSize, setChunkSize] = useState(defaultChunkSize);

  const handleConfirm = () => {
    onConfirm(chunkSize);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Configure Chunk Size</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chunk Size: {chunkSize.toLocaleString()} characters
          </label>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(chunkSize - 1000) / 70}%, #e5e7eb ${(chunkSize - 1000) / 70}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1,000</span>
            <span>8,000</span>
          </div>
        </div>


        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChunkSizeConfig;