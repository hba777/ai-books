import React, { useState } from "react";
import api from "@/lib/api";

interface AgentFormValues {
  name: string;
  status: "Active" | "Disabled";
  description: string;
  basicPrompt: string;
  policyGuidelines: string;
  knowledgeBases: string;
}

interface InDepthAnalysisAgentFormProps {
  initialValues?: Partial<AgentFormValues>;
  mode: "add" | "edit";
  onSubmit?: (values: AgentFormValues) => void;
  onCancel: () => void;
  agentId?: string; // for edit
}

const defaultValues: AgentFormValues = {
  name: "",
  status: "Active",
  description: "",
  basicPrompt: "",
  policyGuidelines: "",
  knowledgeBases: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "add") {
        await api.post("/agents", values);
      } else if (mode === "edit" && agentId) {
        await api.put(`/agents/${agentId}`, values);
      }
      onSubmit?.(values);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
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
        <h2 className="text-2xl font-bold mb-2">{mode === "add" ? "Add Agent" : `Edit Agent: ${values.name}`}</h2>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold">Agent Name</label>
            <input
              className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="name"
              value={values.name}
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
          <label className="font-semibold">Description</label>
          <input
            className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            name="description"
            value={values.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Basic Prompt</label>
          <textarea
            className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            name="basicPrompt"
            value={values.basicPrompt}
            onChange={handleChange}
            rows={2}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Policy Guidelines</label>
          <textarea
            className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            name="policyGuidelines"
            value={values.policyGuidelines}
            onChange={handleChange}
            rows={2}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Knowledge Bases</label>
          <input
            className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            name="knowledgeBases"
            value={values.knowledgeBases}
            onChange={handleChange}
            required
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
