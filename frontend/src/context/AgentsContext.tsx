import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Agent,
  getAllAgents,
  createAgent as apiCreateAgent,
  updateAgent as apiUpdateAgent,
  deleteAgent as apiDeleteAgent,
  powerToggleAgent as apiPowerToggleAgent
} from '../services/agentsApi';
import { useUser } from "../context/UserContext";
interface AgentsContextType {
  agents: Agent[];
  loading: boolean;
  fetchAgents: () => Promise<void>;
  createAgent: (agent: Omit<Agent, '_id' | 'type'>, type: 'classification' | 'analysis') => Promise<Agent>;
  updateAgent: (id: string, agent: Omit<Agent, '_id'>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  powerToggleAgent: (id: string, status: boolean) => Promise<Agent>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export const AgentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: userLoading } = useUser(); 
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await getAllAgents();
      setAgents(res.agents);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agent: Omit<Agent, '_id' | 'type'>, type: 'classification' | 'analysis') => {
    const newAgent = await apiCreateAgent({ ...agent, type });
    await fetchAgents();
    return newAgent;
  };

  const updateAgent = async (id: string, agent: Omit<Agent, '_id'>) => {
    const updated = await apiUpdateAgent(id, agent);
    await fetchAgents();
    return updated;
  };

  const deleteAgent = async (id: string) => {
    await apiDeleteAgent(id);
    await fetchAgents();
  };

  const powerToggleAgent = async (id: string, status: boolean) => {
    const updated = await apiPowerToggleAgent(id, status);
    await fetchAgents();
    return updated;
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchAgents();
    } else if (!userLoading && !user) {
      setAgents([]); // clear if logged out
    }
  }, [user, userLoading]);;

  return (
    <AgentsContext.Provider value={{ agents, loading, fetchAgents, createAgent, updateAgent, deleteAgent, powerToggleAgent }}>
      {children}
    </AgentsContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (!context) throw new Error('useAgents must be used within AgentsProvider');
  return context;
};
