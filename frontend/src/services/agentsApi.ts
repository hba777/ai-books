import api from '../lib/api';

export interface Agent {
  id: string;
  agent_name: string;
  description: string;
  type: string;
  criteria?: string | null;
  guidelines?: string | null;
  status?: boolean;
  evaluators_prompt?: string | null;
  classifier_prompt?: string | null;
}

// Get all agents
export const getAllAgents = async (): Promise<{ agents: Agent[] }> => {
  const response = await api.get('/agents/');
  return response.data;
};

// Create a new agent
export const createAgent = async (agentData: Omit<Agent, 'id'>): Promise<Agent> => {
  const response = await api.post('/agents/', agentData);
  return response.data;
};

// Update an agent
export const updateAgent = async (agentId: string, agentData: Omit<Agent, 'id'>): Promise<Agent> => {
  const response = await api.put(`/agents/${agentId}`, agentData);
  return response.data;
};

// Delete an agent
export const deleteAgent = async (agentId: string): Promise<{ detail: string; agent_id?: string }> => {
  const response = await api.delete(`/agents/${agentId}`);
  return response.data;
};
