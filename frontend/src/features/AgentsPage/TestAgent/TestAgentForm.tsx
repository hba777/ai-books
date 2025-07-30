import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAgents } from '@/context/AgentsContext';

interface TestAgentFormProps {
  agentId: string;
  agentName: string;
  open: boolean;
  onClose: () => void;
}

const TestAgentForm: React.FC<TestAgentFormProps> = ({
  agentId,
  agentName,
  open,
  onClose
}) => {
  const { testAgent } = useAgents();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text to test');
      return;
    }

    setLoading(true);
    try {
      const response = await testAgent(agentId, text);
      setResult(response.result);
      toast.success('Agent test completed successfully');
    } catch (error) {
      toast.error('Failed to test agent');
      console.error('Test agent error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText('');
    setResult(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Agent: {agentName}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="testText" className="block text-sm font-medium text-gray-700 mb-2">
              Test Text
            </label>
            <textarea
              id="testText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to test the agent..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Agent'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Test Result:</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAgentForm;
