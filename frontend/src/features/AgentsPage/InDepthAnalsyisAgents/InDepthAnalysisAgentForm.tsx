import React, { useState, useRef } from "react";
import { useAgents } from "@/context/AgentsContext";
import { KnowledgeBaseItem } from "@/services/agentsApi";
import KnowledgeBaseForm from "./KnowledgeBaseForm";
import { validatePDF } from "@/utils/pdfValidator";

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
  const { updateAgent, analyzePolicyWithAgent } = useAgents(); 
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [newPolicies, setNewPolicies] = useState<string>("");

  // Validation function
  const validatePrompt = (prompt: string) => {
    if (!prompt.trim()) return "Field cannot be empty";
    if (prompt.length > 2000) return "Text too long (max 2000 characters)";
    const injectionPattern = /ignore all|disregard previous|instead/i;
    if (injectionPattern.test(prompt)) return "Suspicious content detected";
    return null;
  };

  const validateFields = () => {
    const errors: { criteria?: string; guidelines?: string } = {};
    const criteriaError = validatePrompt(values.criteria);
    if (criteriaError) {
      errors.criteria = criteriaError;
    }
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
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    // Validate PDF (client-side heuristics)
    try {
      setAnalysisLoading(true);
      setError(null);
      const validation = await validatePDF(file);
      if (!validation.isValid) {
        setAnalysisLoading(false);
        setError(validation.error || "Invalid PDF file");
        return;
      }
      if (!agentId) {
        setAnalysisLoading(false);
        setError("Agent ID is required to analyze policy");
        return;
      }
      const res = await analyzePolicyWithAgent(agentId, file);
      setNewPolicies(res.result || "");
      setDialogOpen(true);
    } catch (err: any) {
      setError("Failed to analyze PDF");
    } finally {
      setAnalysisLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAcceptPolicies = () => {
    const normalizeLines = (text: string): string[] => {
      return text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/^\s*(?:\d+\.|[-•])\s*/, '')) // strip leading numbering/bullets
        .map(l => l.replace(/\s+/g, ' ').trim()); // collapse extra spaces
    };

    const currentItems = normalizeLines(values.guidelines);
    const newItems = normalizeLines(newPolicies);

    const seen = new Set<string>();
    const merged: string[] = [];

    for (const item of [...currentItems, ...newItems]) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    const formatted = merged.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
    setValues(prev => ({ ...prev, guidelines: formatted }));
    setDialogOpen(false);
  };

  const handleRejectPolicies = () => {
    setDialogOpen(false);
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
          <label className="font-semibold">Criteria</label>
          <textarea
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              fieldErrors.criteria ? 'border-red-500' : 'border-gray-400'
            }`}
            name="criteria"
            value={values.criteria}
            onChange={handleChange}
            rows={3}
            placeholder={`- Criteria 1 \n- Criteria 2`}
            required
          />
          {fieldErrors.criteria && (
            <div className="text-red-500 text-sm">{fieldErrors.criteria}</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Policy Guidelines</label>
            {mode === "edit" && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={triggerFilePicker} className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700" disabled={analysisLoading || !agentId} title={!agentId ? 'Save the agent first to enable analysis' : 'Upload PDF to analyze policies'}>
                  +
                </button>
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelected} className="hidden" />
              </div>
            )}
          </div>
          <textarea
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              fieldErrors.guidelines ? 'border-red-500' : 'border-gray-400'
            }`}
            name="guidelines"
            value={values.guidelines}
            onChange={handleChange}
            rows={3}
            placeholder={`1. Guideline 1 \n2. Guideline 2`}
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

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
            <h3 className="text-lg font-semibold mb-4">Proposed Policy Updates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Current Policies</div>
                <div className="border rounded p-3 text-sm whitespace-pre-wrap min-h-[200px] max-h-[300px] overflow-auto">{values.guidelines || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">New Policies (From PDF)</div>
                <div className="border rounded p-3 text-sm whitespace-pre-wrap min-h-[200px] max-h-[300px] overflow-auto">{newPolicies || '—'}</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleRejectPolicies} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">Reject</button>
              <button onClick={handleAcceptPolicies} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InDepthAnalysisAgentForm;
