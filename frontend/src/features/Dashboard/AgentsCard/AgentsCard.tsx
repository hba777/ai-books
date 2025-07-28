import React, { useEffect, useState } from 'react';
import ClassificationAgentRow from './ClassificationAgentRow';
import InDepthAnalysisAgentRow from './InDepthAnalysisAgentRow';
import { getAllAgents, Agent } from '../../../services/agentsApi';

const AgentsCard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await getAllAgents();
        setAgents(response.agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Filter agents by type
  const classificationAgents = agents.filter(agent => agent.type === 'classification');
  const analysisAgents = agents.filter(agent => agent.type === 'analysis');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 w-full max-w-6xl mx-auto mt-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 100%)', height: '6px'}} />
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading agents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-7xl mx-auto mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{background: 'linear-gradient(90deg, #3B82F6 0%, #9333EA 100%)', height: '6px'}} />
      {/* Classification Agents Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Currently Running Classification Agents</h2>
            <p className="text-gray-500 text-sm">Here's the data of and analytics of books or documents.</p>
          </div>
          <button className="from-[#3B82F6] to-[#9333EA] bg-gradient-to-r text-white px-6 py-2 rounded-lg text-sm h-10">Total Agents: {classificationAgents.length}</button>
        </div>
        <ClassificationAgentRow agents={classificationAgents} />
      </div>
      {/* In-Depth Classification Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Currently Running In-Depth Classification Agents</h2>
            <p className="text-gray-500 text-sm">Here's the data of and analytics of books or documents.</p>
          </div>
          <button className="from-[#3B82F6] to-[#9333EA] bg-gradient-to-r text-white px-6 py-2 rounded-lg text-sm h-10">Total Agents: {analysisAgents.length}</button>
        </div>
        <InDepthAnalysisAgentRow agents={analysisAgents} />
      </div>
    </div>
  );
};

export default AgentsCard;
