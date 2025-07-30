import React, { useState } from "react";
import { KnowledgeBaseItem } from "@/services/agentsApi";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

interface KnowledgeBaseFormProps {
  value: Omit<KnowledgeBaseItem, "_id">[];
  onChange: (value: Omit<KnowledgeBaseItem, "_id">[]) => void;
  isNested?: boolean; // To prevent nested forms
}

interface KnowledgeBaseItemFormData {
  json_data: string;
  main_category: string;
  sub_category: string;
  topic: string;
}

const KnowledgeBaseForm: React.FC<KnowledgeBaseFormProps> = ({
  value,
  onChange,
  isNested = false,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<KnowledgeBaseItemFormData>({
    json_data: "",
    main_category: "",
    sub_category: "",
    topic: "",
  });

  const handleAdd = () => {
    setFormData({
      json_data: "",
      main_category: "",
      sub_category: "",
      topic: "",
    });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (index: number) => {
    const item = value[index];
    setFormData({
      json_data: item.json_data,
      main_category: item.main_category,
      sub_category: item.sub_category || "",
      topic: item.topic,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Omit<KnowledgeBaseItem, "_id"> = {
      json_data: formData.json_data,
      main_category: formData.main_category,
      sub_category: formData.sub_category,
      topic: formData.topic,
    };

    if (editingIndex !== null) {
      // Edit existing item
      const newValue = [...value];
      newValue[editingIndex] = newItem;
      onChange(newValue);
    } else {
      // Add new item
      onChange([...value, newItem]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Knowledge Base Items List */}
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray/60 rounded-lg border"
          >
            <span className="font-medium text-gray-800">{item.topic}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEdit(index)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit"
              >
                <FaEdit size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Delete"
              >
                <FaTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaPlus size={14} />
        Add Knowledge Base Item
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null
                ? "Edit Knowledge Base Item"
                : "Add Knowledge Base Item"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category *
                </label>
                <input
                  type="text"
                  value={formData.main_category}
                  onChange={(e) =>
                    setFormData({ ...formData, main_category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category *
                </label>
                <input
                  type="text"
                  value={formData.sub_category}
                  onChange={(e) =>
                    setFormData({ ...formData, sub_category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  JSON Data *
                </label>
                <textarea
                  value={formData.json_data}
                  onChange={(e) =>
                    setFormData({ ...formData, json_data: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter JSON data..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseForm;
