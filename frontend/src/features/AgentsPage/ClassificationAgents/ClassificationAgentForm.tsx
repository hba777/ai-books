import React, { useState } from "react";
import { useAgents } from "@/context/AgentsContext"; // <-- Import the hook
import { extractHeadingsAndPoints } from "./EditAgentUtils"  
interface AgentFormValues {
  agent_name: string;
  status: "Active" | "Disabled";
  classifier_prompt: string;
  evaluators_prompt: string;
  agentId?: string; 

}

interface ClassificationAgentFormProps {
  initialValues?: Partial<AgentFormValues>;
  mode: "add" | "edit";
  onSubmit?: (values: AgentFormValues) => void;
  onCancel: () => void;
  agentId?: string
}

const defaultValues: AgentFormValues = {
  agent_name: "",
  status: "Active",
  classifier_prompt: "",
  evaluators_prompt: ""
};

const ClassificationAgentForm: React.FC<ClassificationAgentFormProps> = ({
  initialValues = {},
  mode,
  onSubmit,
  onCancel,
  agentId

}) => {
  const [values, setValues] = useState<AgentFormValues>({ ...defaultValues, ...initialValues });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAgent } = useAgents(); // <-- Get updateAgent from context

  // State for edit mode JSON UI
  const [classifierHeadingsPoints, setClassifierHeadingsPoints] = useState<{ heading: string; points: string[] }[]>([]);
  const [evaluatorHeadingsPoints, setEvaluatorHeadingsPoints] = useState<{ heading: string; points: string[] }[]>([]);

  React.useEffect(() => {
    if (mode === "edit") {
      setClassifierHeadingsPoints(extractHeadingsAndPoints(values.classifier_prompt));
      setEvaluatorHeadingsPoints(extractHeadingsAndPoints(values.evaluators_prompt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, values.classifier_prompt, values.evaluators_prompt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "edit" && agentId) {
        await updateAgent(agentId, {
          agent_name: values.agent_name,
          status: values.status === "Active",
          type: "classification",
          classifier_prompt: values.classifier_prompt,
          evaluators_prompt: values.evaluators_prompt
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
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col gap-4 border-t-4 border-blue-500"
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
      
        {mode === "edit" && classifierHeadingsPoints.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            <label className="font-semibold">Classifier Prompt Items</label>
            <div className="bg-gray-100 rounded p-3 mb-2">
              {classifierHeadingsPoints.map(({ heading, points }, i) => (
                <div key={i} className="mb-2">
                  <div className="font-semibold text-gray-700 whitespace-pre-line">{heading}</div>
                  {points.map((point, idx) => (
                    <input
                      key={idx}
                      className="border-b border-blue-300 bg-white px-1 py-0.5 focus:outline-none w-full mt-1"
                      value={point}
                      onChange={e => {
                        setClassifierHeadingsPoints(prev => prev.map((h, j) =>
                          j === i ? { ...h, points: h.points.map((p, k) => k === idx ? e.target.value : p) } : h
                        ));
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className="ml-2 text-blue-500 hover:text-blue-700 text-lg font-bold mt-2"
                    onClick={() => setClassifierHeadingsPoints(prev => prev.map((h, j) =>
                      j === i ? { ...h, points: [...h.points, ''] } : h
                    ))}
                    title="Add item"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {mode === "add" && (
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Classifier Prompt</label>
            <textarea
              className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="classifier_prompt"
              value={values.classifier_prompt}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
        )}
        {mode === "edit" && evaluatorHeadingsPoints.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            <label className="font-semibold">Evaluator Prompt Items</label>
            <div className="bg-gray-100 rounded p-3 mb-2">
              {evaluatorHeadingsPoints.map(({ heading, points }, i) => (
                <div key={i} className="mb-2">
                  <div className="font-semibold text-gray-700 whitespace-pre-line">{heading}</div>
                  {points.map((point, idx) => (
                    <input
                      key={idx}
                      className="border-b border-blue-300 bg-white px-1 py-0.5 focus:outline-none w-full mt-1"
                      value={point}
                      onChange={e => {
                        setEvaluatorHeadingsPoints(prev => prev.map((h, j) =>
                          j === i ? { ...h, points: h.points.map((p, k) => k === idx ? e.target.value : p) } : h
                        ));
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className="ml-2 text-blue-500 hover:text-blue-700 text-lg font-bold mt-2"
                    onClick={() => setEvaluatorHeadingsPoints(prev => prev.map((h, j) =>
                      j === i ? { ...h, points: [...h.points, ''] } : h
                    ))}
                    title="Add item"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {mode === "add" && (
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Evaluator Prompt</label>
            <textarea
              className="border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="evaluators_prompt"
              value={values.evaluators_prompt}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
        )}
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

export default ClassificationAgentForm;
