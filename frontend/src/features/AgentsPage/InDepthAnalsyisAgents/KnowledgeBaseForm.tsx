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

interface FieldErrors {
  topic?: string;
  main_category?: string;
  sub_category?: string;
  json_data?: string;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Validation functions
  const validateTopic = (topic: string): string | null => {
    if (!topic.trim()) return "Topic is required";
    if (topic.length < 3) return "Topic must be at least 3 characters";
    if (topic.length > 100) return "Topic must be less than 100 characters";
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(topic)) return "Topic contains invalid characters";
    return null;
  };

  const validateMainCategory = (category: string): string | null => {
    if (!category.trim()) return "Main category is required";
    if (category.length < 2) return "Main category must be at least 2 characters";
    if (category.length > 50) return "Main category must be less than 50 characters";
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(category)) return "Main category contains invalid characters";
    return null;
  };

  const validateSubCategory = (category: string): string | null => {
    if (!category.trim()) return "Sub category is required";
    if (category.length < 2) return "Sub category must be at least 2 characters";
    if (category.length > 50) return "Sub category must be less than 50 characters";
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(category)) return "Sub category contains invalid characters";
    return null;
  };

  const validateJsonData = (jsonData: string): string | null => {
    if (!jsonData.trim()) return "Description is required";
    
    // Try to parse JSON if it looks like JSON
    if (jsonData.trim().startsWith('{') || jsonData.trim().startsWith('[')) {
      try {
        JSON.parse(jsonData);
      } catch {
        return "Invalid JSON format";
      }
    }
    
    return null;
  };

  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {};
    
    const topicError = validateTopic(formData.topic);
    if (topicError) errors.topic = topicError;
    
    const mainCategoryError = validateMainCategory(formData.main_category);
    if (mainCategoryError) errors.main_category = mainCategoryError;
    
    const subCategoryError = validateSubCategory(formData.sub_category);
    if (subCategoryError) errors.sub_category = subCategoryError;
    
    const jsonDataError = validateJsonData(formData.json_data);
    if (jsonDataError) errors.json_data = jsonDataError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setFormData({
      json_data: "",
      main_category: "",
      sub_category: "",
      topic: "",
    });
    setEditingIndex(null);
    setFieldErrors({});
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
    setFieldErrors({});
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleFieldChange = (field: keyof KnowledgeBaseItemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateAllFields()) {
      return;
    }

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
    setFieldErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFieldErrors({});
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
                  onChange={(e) => handleFieldChange('topic', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.topic ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.topic && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.topic}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category *
                </label>
                <input
                  type="text"
                  value={formData.main_category}
                  onChange={(e) => handleFieldChange('main_category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.main_category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.main_category && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.main_category}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category *
                </label>
                <input
                  type="text"
                  value={formData.sub_category}
                  onChange={(e) => handleFieldChange('sub_category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.sub_category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.sub_category && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.sub_category}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.json_data}
                  onChange={(e) => handleFieldChange('json_data', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.json_data ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Enter description"
                  required
                />
                {fieldErrors.json_data && (
                  <div className="text-red-500 text-sm mt-1">{fieldErrors.json_data}</div>
                )}
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