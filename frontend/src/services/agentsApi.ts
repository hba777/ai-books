import api from '../lib/api';

export interface KnowledgeBaseItem {
  _id: string;
  json_data: string;
  main_category: string;
  sub_category?: string | null;
  topic: string;
}

export interface Agent {
  _id: string;
  agent_name: string;
  type: string;
  criteria?: string | null;
  guidelines?: string | null;
  status?: boolean;
  evaluators_prompt?: string | null;
  classifier_prompt?: string | null;
  knowledge_base?: KnowledgeBaseItem[] | null;
}

// Type for creating agents (without _id and with optional knowledge_base)
export type CreateAgentData = Omit<Agent, '_id' | 'knowledge_base'> & {
  knowledge_base?: Omit<KnowledgeBaseItem, '_id'>[] | null;
};

// Type for updating agents (without _id and with flexible knowledge_base)
export type UpdateAgentData = Omit<Agent, '_id' | 'knowledge_base'> & {
  knowledge_base?: (KnowledgeBaseItem | Omit<KnowledgeBaseItem, '_id'>)[] | null;
};

// Get all agents
export const getAllAgents = async (): Promise<{ agents: Agent[] }> => {
  const response = await api.get('/agents/');
  return response.data;
};

// Create a new agent
export const createAgent = async (agentData: CreateAgentData): Promise<Agent> => {
  const response = await api.post('/agents/', agentData);
  return response.data;
};

// Update an agent
export const updateAgent = async (agentId: string, agentData: UpdateAgentData): Promise<Agent> => {
  const response = await api.put(`/agents/${agentId}`, agentData);
  return response.data;
};

// Delete an agent
export const deleteAgent = async (agentId: string): Promise<{ detail: string; agent_id?: string }> => {
  const response = await api.delete(`/agents/${agentId}`);
  return response.data;
};

// Power toggle agent (patch status)
export const powerToggleAgent = async (agentId: string, status: boolean): Promise<Agent> => {
  const response = await api.patch(`/agents/${agentId}`, { status });
  return response.data;
};
