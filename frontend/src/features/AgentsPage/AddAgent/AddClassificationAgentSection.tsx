import React, { useState } from "react";
import { useAgents } from "@/context/AgentsContext";
import ClassificationAgentForm from "../ClassificationAgents/ClassificationAgentForm";

interface AddClassificationAgentSectionProps {
  title: string;
  description: string;
  onAdd?: () => void;
  buttonLabel?: string;
}

const AddClassificationAgentSection: React.FC<AddClassificationAgentSectionProps> = ({
  title,
  description,
  buttonLabel = "+ Add Agent",
  onAdd,
}) => {
  const { createAgent } = useAgents();
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setShowForm(true);
  };
  const handleFormSubmit = async (values: any) => {
    // Map form values to API fields
    const payload = {
      agent_name: values.agent_name,
      description: values.description,
      status: values.status === "Active",
      classifier_prompt: values.classifier_prompt,
    };
  
  
    try {
      await createAgent(payload, "classification");
  
      setShowForm(false);
      if (onAdd) onAdd();
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };
  

  return (
    <>
      <div className="flex items-center justify-between mb-2 w-full">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-black">{title}</span>
          <span className="text-base text-gray-500">{description}</span>
        </div>
        <button
          className="bg-gradient-to-r from-[#3B82F6] to-[#9333EA] text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition flex items-center gap-2 cursor-pointer"
          onClick={handleAdd}
        >
          {buttonLabel}
        </button>
      </div>
      {showForm && (
        <ClassificationAgentForm
          mode="add"
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default AddClassificationAgentSection;
