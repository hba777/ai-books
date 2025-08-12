import React, { useState } from "react";
import { useAgents } from "@/context/AgentsContext";
import { KnowledgeBaseItem } from "@/services/agentsApi";
import KnowledgeBaseForm from "./KnowledgeBaseForm";

interface AgentFormValues {
  agent_name: string;
  status: "Active" | "Disabled";
  criteria: string;
  guidelines: string;
  knowledge_base: Omit<KnowledgeBaseItem, '_id'>[];
}

interface InDepthAnalysisAgentFormProps {
  initialValues?: Partial<AgentFormValues>;
  mode: "add" | "edit";
  onSubmit?: (values: AgentFormValues) => void;
  onCancel: () => void;
  agentId?: string; // for edit
}

const defaultValues: AgentFormValues = {
  agent_name: "",
  status: "Active",
  criteria: "",
  guidelines: "",
  knowledge_base: [],
};

const InDepthAnalysisAgentForm: React.FC<InDepthAnalysisAgentFormProps> = ({
  initialValues = {},
  mode,
  onSubmit,
  onCancel,
  agentId,
}) => {
  const [values, setValues] = useState<AgentFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ criteria?: string; guidelines?: string }>({});
  const { updateAgent } = useAgents(); 

  // Validation function
  const validatePrompt = (prompt: string) => {
    try {
      const parsed = JSON.parse(prompt);

      // Structure check
      if (!parsed.criteria || !parsed.guidelines) return "Missing required keys";

      // Content check
      if (parsed.criteria.trim().length === 0 || parsed.guidelines.trim().length === 0)
        return "Criteria and guidelines cannot be empty";

      // Length check
      if (parsed.criteria.length > 2000 || parsed.guidelines.length > 2000)
        return "Text too long";

      // Injection prevention (basic example)
      const injectionPattern = /ignore all|disregard previous|instead/i;
      if (injectionPattern.test(parsed.criteria) || injectionPattern.test(parsed.guidelines))
        return "Suspicious content detected";

      return null; // No errors
    } catch {
      return "Invalid JSON format";
    }
  };

  const validateFields = () => {
    const errors: { criteria?: string; guidelines?: string } = {};
    
    // Validate criteria
    const criteriaError = validatePrompt(values.criteria);
    if (criteriaError) {
      errors.criteria = criteriaError;
    }
    
    // Validate guidelines
    const guidelinesError = validatePrompt(values.guidelines);
    if (guidelinesError) {
      errors.guidelines = guidelinesError;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields before submission
    if (!validateFields()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (mode === "edit" && agentId) {
        await updateAgent(agentId, {
          agent_name: values.agent_name,
          status: values.status === "Active",
          type: "analysis",
          criteria: values.criteria,
          guidelines: values.guidelines,
          knowledge_base: values.knowledge_base
        });
      }
      onSubmit?.(values);
    } catch (err: any) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl flex flex-col gap-4 border-t-4 border-blue-500"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-2">{mode === "add" ? "Add Agent" : `Edit Agent: ${values.agent_name}`}</h2>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold">Agent Name</label>
            <input
              className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="agent_name"
              value={values.agent_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold">Status</label>
            <select
              className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="status"
              value={values.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Criteria (JSON format)</label>
          <textarea
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              fieldErrors.criteria ? 'border-red-500' : 'border-gray-400'
            }`}
            name="criteria"
            value={values.criteria}
            onChange={handleChange}
            rows={3}
            placeholder='{"criteria": "Your criteria here", "guidelines": "Your guidelines here"}'
            required
          />
          {fieldErrors.criteria && (
            <div className="text-red-500 text-sm">{fieldErrors.criteria}</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Policy Guidelines (JSON format)</label>
          <textarea
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              fieldErrors.guidelines ? 'border-red-500' : 'border-gray-400'
            }`}
            name="guidelines"
            value={values.guidelines}
            onChange={handleChange}
            rows={3}
            placeholder='{"criteria": "Your criteria here", "guidelines": "Your guidelines here"}'
            required
          />
          {fieldErrors.guidelines && (
            <div className="text-red-500 text-sm">{fieldErrors.guidelines}</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Knowledge Bases</label>
          <KnowledgeBaseForm
            value={values.knowledge_base}
            onChange={(newValue) => setValues(prev => ({ ...prev, knowledge_base: newValue }))}
            isNested={true}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition"
            disabled={loading}
          >
            {mode === "add" ? "Add Agent" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InDepthAnalysisAgentForm;
