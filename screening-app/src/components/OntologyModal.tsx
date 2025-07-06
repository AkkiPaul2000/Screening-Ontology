import { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  OntologyFormData,
  TreeNode,
  Criteria,
  RuleGroup,
} from "../types/ontology";
import {
  validateOntologyStructure,
  ValidationResult,
} from "../utils/validation";
import Tree from "./Tree";
import RulesBuilder from "./RulesBuilder";
import ConfirmationModal from "./ConfirmationModal";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

interface OntologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OntologyFormData) => void;
  initialData?: OntologyFormData;
}

const defaultFormData: OntologyFormData = {
  roleType: "",
  description: "",
  structure: [
    {
      id: "root-layer",
      name: "Root Layer",
      type: "layer",
      children: [],
    },
  ],
};

const OntologyModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: OntologyModalProps) => {
  const [formData, setFormData] = useState<OntologyFormData>(defaultFormData);
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria | null>(
    null,
  );
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [criteriaInit, setCriteriaInit] = useState<Boolean>(false);
  const [originalData, setOriginalData] = useState<OntologyFormData | null>(
    null,
  );
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    invalidCriteriaIds: [],
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    // Always clear form data first to ensure fresh state
    if (!initialData) {
      clearFormData();
      return;
    }

    let dataToUse = initialData;

    // Ensure there's always a root layer
    if (!dataToUse.structure || dataToUse.structure.length === 0) {
      dataToUse = {
        ...dataToUse,
        roleType: "Root Layer", // Ensure roleType is set to root layer name
        structure: [
          {
            id: "root-layer",
            name: "Root Layer",
            type: "layer",
            children: [],
          },
        ],
      };
    }

    setFormData(dataToUse);
    // Store original data for edit mode reversion
    if (initialData) {
      setOriginalData(JSON.parse(JSON.stringify(initialData)));
    } else {
      setOriginalData(null);
    }
    // Validate the loaded data
    const validation = validateOntologyStructure(dataToUse.structure);
    setValidationResult(validation);

    // Set root layer as default selected
    const rootLayer = dataToUse.structure.find(
      (node) => node.id === "root-layer",
    );
    if (rootLayer) {
      setSelectedNode(rootLayer);
      // Always ensure roleType matches the root layer name
      setFormData((prev) => ({
        ...prev,
        roleType: rootLayer.name,
        structure: prev.structure,
      }));
    }
  }, [initialData]);

  // Validate structure whenever formData changes
  useEffect(() => {
    const validation = validateOntologyStructure(formData.structure);
    setValidationResult(validation);
  }, [formData.structure]);

  const clearFormData = () => {
    const freshData = {
      roleType: "Root Layer", // Set the default role type to match root layer name
      description: "",
      structure: [
        {
          id: "root-layer",
          name: "Root Layer",
          type: "layer" as const,
          children: [],
        },
      ],
    };
    setFormData(freshData);
    setSelectedCriteria(null);
    setSelectedNode(freshData.structure[0]);
    setCriteriaInit(false);
    setOriginalData(null);
    setValidationResult({
      isValid: true,
      errors: [],
      invalidCriteriaIds: [],
    });
  };

  const hasUnsavedChanges = () => {
    if (!originalData) {
      // In add mode, check if any data has been entered
      return (
        formData.roleType.trim() !== "" ||
        formData.description.trim() !== "" ||
        formData.structure.some(
          (node) => node.id !== "root-layer" || node.name !== "Root Layer",
        )
      );
    } else {
      // In edit mode, compare with original data
      return JSON.stringify(formData) !== JSON.stringify(originalData);
    }
  };

  const getFieldValidationMessage = () => {
    if (!selectedNode) {
      return "Role type is required";
    }
    if (!formData.roleType.trim()) {
      return `${selectedNode.type === "layer" ? "Layer" : "Criteria"} name is required`;
    }
    return "";
  };

  const handleClose = () => {
    // Check for unsaved changes and confirm
    if (hasUnsavedChanges()) {
      const confirmMessage = originalData
        ? "You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
        : "You have unsaved data. Are you sure you want to cancel? All data will be lost.";

      setConfirmationModal({
        isOpen: true,
        title: "Unsaved Changes",
        message: confirmMessage,
        onConfirm: () => {
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          performClose();
        },
      });
      return;
    }
    performClose();
  };

  const performClose = () => {
    // Revert to original data if in edit mode, otherwise clear
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      // Reset selections
      setSelectedCriteria(null);
      setSelectedNode(null);
      setCriteriaInit(false);
      // Set root layer as selected
      const rootLayer = originalData.structure.find(
        (node) => node.id === "root-layer",
      );
      if (rootLayer) {
        setSelectedNode(rootLayer);
        setFormData((prev) => ({ ...prev, roleType: rootLayer.name }));
      }
      // Validate original data
      const validation = validateOntologyStructure(originalData.structure);
      setValidationResult(validation);
    } else {
      clearFormData();
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If roleType is being cleared manually, clear the selected node
    if (name === "roleType" && value === "") {
      setSelectedNode(null);
    }
  };

  const handleStructureUpdate = (newStructure: TreeNode[]) => {
    setFormData((prev) => ({ ...prev, structure: newStructure }));

    // If selected criteria was deleted, select parent layer
    if (selectedCriteria) {
      const findCriteriaAndParent = (
        nodes: TreeNode[],
        parent: TreeNode | null = null,
      ): { found: boolean; parent: TreeNode | null } => {
        for (const node of nodes) {
          if (node.type === "criteria" && node.id === selectedCriteria.id) {
            return { found: true, parent };
          }
          if (node.type === "layer" && (node as any).children) {
            const result = findCriteriaAndParent((node as any).children, node);
            if (result.found) {
              return result;
            }
          }
        }
        return { found: false, parent: null };
      };

      const result = findCriteriaAndParent(newStructure);
      if (!result.found) {
        setSelectedCriteria(null);
        // Select parent layer if available, otherwise root layer
        const parentToSelect =
          result.parent ||
          newStructure.find((node) => node.id === "root-layer");
        if (parentToSelect) {
          setSelectedNode(parentToSelect);
          setFormData((prev) => ({ ...prev, roleType: parentToSelect.name }));
        }
      }
    }

    // Validation will be triggered by useEffect
  };

  const handleCriteriaSelect = (criteria: Criteria) => {
    setSelectedCriteria(criteria);
  };

  const handleNodeSelectAndClearCriteria = (node: TreeNode | null) => {
    setSelectedNode(node);
    setFormData((prev) => ({ ...prev, roleType: node ? node.name : "" }));

    // If selecting a layer, clear criteria selection to hide rules
    if (node && node.type === "layer") {
      setSelectedCriteria(null);
    }
    // For criteria nodes, handleCriteriaSelect will be called separately
    // and will set the selectedCriteria properly
  };

  const handleNodeSelect = (node: TreeNode | null) => {
    handleNodeSelectAndClearCriteria(node);
  };

  const handleNodeNameChange = (newName: string) => {
    if (selectedNode) {
      // Update the node name in the structure
      const updateNodeName = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedNode.id) {
            return { ...node, name: newName };
          }
          if (node.type === "layer" && (node as any).children) {
            return {
              ...node,
              children: updateNodeName((node as any).children),
            };
          }
          return node;
        });
      };

      const updatedStructure = updateNodeName(formData.structure);

      // Always update roleType to match the selected node name
      setFormData((prev) => ({
        ...prev,
        roleType: newName,
        structure: updatedStructure,
      }));

      // Update selected node reference
      const updatedNode = { ...selectedNode, name: newName };
      setSelectedNode(updatedNode);

      // If the updated node is a criteria, also update selectedCriteria
      if (
        selectedNode.type === "criteria" &&
        selectedCriteria &&
        selectedCriteria.id === selectedNode.id
      ) {
        setSelectedCriteria({ ...selectedCriteria, name: newName });
      }
    }
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;

    if (selectedNode.id === "root-layer") {
      setConfirmationModal({
        isOpen: true,
        title: "Cannot Delete",
        message:
          "Root layer cannot be deleted as it's required for the ontology structure.",
        onConfirm: () => {
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        },
      });
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: `Delete ${selectedNode.type === "layer" ? "Layer" : "Criteria"}`,
      message: `Are you sure you want to delete "${selectedNode.name}"? This action cannot be undone.`,
      onConfirm: () => {
        setConfirmationModal({ ...confirmationModal, isOpen: false });
        performDelete();
      },
    });
  };

  const performDelete = () => {
    if (!selectedNode) return;
    // Find parent and delete the node
    const deleteRecursively = (
      nodes: TreeNode[],
      targetNode: TreeNode,
      parent: TreeNode | null = null,
    ): { deleted: boolean; parent: TreeNode | null } => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetNode.id) {
          nodes.splice(i, 1);
          return { deleted: true, parent };
        }
        if (nodes[i].type === "layer") {
          const layer = nodes[i] as any;
          if (layer.children) {
            const result = deleteRecursively(
              layer.children,
              targetNode,
              nodes[i],
            );
            if (result.deleted) {
              return result;
            }
          }
        }
      }
      return { deleted: false, parent: null };
    };

    const newStructure = [...formData.structure];
    const result = deleteRecursively(newStructure, selectedNode);

    setFormData((prev) => ({
      ...prev,
      structure: newStructure,
    }));

    // Select parent or root layer
    const nodeToSelect =
      result.parent || newStructure.find((node) => node.id === "root-layer");

    if (nodeToSelect) {
      setSelectedNode(nodeToSelect);
      setFormData((prev) => ({ ...prev, roleType: nodeToSelect.name }));
    }

    // Clear criteria selection if criteria was deleted
    if (selectedNode.type === "criteria") {
      setSelectedCriteria(null);
    }
  };

  const handleAddRules = () => {
    setCriteriaInit(!criteriaInit);
    if (selectedCriteria) {
      // Create new rule tree
      const newRuleTree = {
        id: crypto.randomUUID(),
        condition: "AND" as "AND" | "OR",
        statements: [
          {
            id: crypto.randomUUID(),
            property: "",
            operator: "Equals" as const,
            value: "",
          },
        ],
        groups: [],
      };

      // Add new rule tree to the rules array
      const currentRules = selectedCriteria.rules || [];
      const updatedRules = [...currentRules, newRuleTree];

      const updatedCriteria = { ...selectedCriteria, rules: updatedRules };
      setSelectedCriteria(updatedCriteria);

      // Recursively update nested structure
      const updateStructure = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedCriteria.id) {
            return updatedCriteria;
          }
          if (node.type === "layer") {
            return {
              ...node,
              children: updateStructure((node as any).children),
            };
          }
          return node;
        });
      };

      const updatedStructure = updateStructure(formData.structure);
      setFormData((prev) => ({ ...prev, structure: updatedStructure }));
    }
  };

  const handleRulesUpdate = (ruleIndex: number, newRules: RuleGroup) => {
    if (selectedCriteria) {
      const currentRules = selectedCriteria.rules || [];
      const updatedRules = [...currentRules];

      // If rules are cleared (empty statements), remove the rule tree
      if (newRules.statements.length === 0) {
        updatedRules.splice(ruleIndex, 1);
      } else {
        updatedRules[ruleIndex] = newRules;
      }

      const updatedCriteria = {
        ...selectedCriteria,
        rules: updatedRules.length === 0 ? undefined : updatedRules,
      };
      setSelectedCriteria(updatedCriteria);

      // Recursively update the structure to ensure persistence
      const updateStructure = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedCriteria.id) {
            return updatedCriteria;
          }
          if (node.type === "layer" && (node as any).children) {
            return {
              ...node,
              children: updateStructure((node as any).children),
            };
          }
          return node;
        });
      };

      const updatedStructure = updateStructure(formData.structure);
      setFormData((prev) => ({ ...prev, structure: updatedStructure }));

      // Validation will be triggered by useEffect
    }
  };

  const handleDeleteRuleTree = (ruleIndex: number) => {
    if (selectedCriteria) {
      const currentRules = selectedCriteria.rules || [];
      const updatedRules = currentRules.filter(
        (_, index) => index !== ruleIndex,
      );

      const updatedCriteria = {
        ...selectedCriteria,
        rules: updatedRules.length === 0 ? undefined : updatedRules,
      };
      setSelectedCriteria(updatedCriteria);

      // Recursively update the structure to ensure persistence
      const updateStructure = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedCriteria.id) {
            return updatedCriteria;
          }
          if (node.type === "layer" && (node as any).children) {
            return {
              ...node,
              children: updateStructure((node as any).children),
            };
          }
          return node;
        });
      };

      const updatedStructure = updateStructure(formData.structure);
      setFormData((prev) => ({ ...prev, structure: updatedStructure }));
    }
  };

  const isFormValid = () => {
    // Check if the root layer name is empty
    if (!formData.roleType.trim()) {
      return false;
    }
    // Check other validation results
    return validationResult.isValid;
  };

  const handleSubmit = () => {
    if (!formData.roleType.trim()) {
      setConfirmationModal({
        isOpen: true,
        title: "Missing Information",
        message: "Root layer name is required.",
        onConfirm: () => {
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        },
      });
      return;
    }

    if (!validationResult.isValid) {
      setConfirmationModal({
        isOpen: true,
        title: "Validation Errors",
        message:
          "Please fix the validation errors before saving:\n" +
          validationResult.errors.join("\n"),
        onConfirm: () => {
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        },
      });
      return;
    }

    // Ensure roleType is always the root layer name before saving
    const rootLayer = formData.structure.find(
      (node) => node.id === "root-layer",
    );
    const finalFormData = {
      ...formData,
      roleType: rootLayer ? rootLayer.name : formData.roleType,
    };

    onSave(finalFormData);
    clearFormData();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden">
        <div className="h-full w-full flex flex-col lg:justify-center lg:items-center lg:p-4 overflow-y-auto lg:overflow-hidden">
          <div className="w-full max-w-7xl h-full lg:h-auto lg:max-h-[90vh] bg-white lg:rounded-lg lg:shadow-xl flex flex-col overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4  bg-header-modal lg:rounded-t-lg">
              <h3 className="text-lg lg:text-xl font-medium text-gray-900">
                {originalData ? "Edit Ontology" : "Add Ontology"}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
            </div>

            {/* Main Content - Tree Structure and Rules Builder */}
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[35%_65%] gap-4 lg:gap-6 p-4 lg:overflow-hidden lg:min-h-0">
              {/* Left Panel - Ontology Structure Tree */}
              <div className="order-1 lg:order-none border border-gray-200 lg:border-0 rounded-lg p-3 lg:p-0 flex flex-col lg:h-[500px] lg:min-h-0">
                <h4 className="text-sm font-medium text-gray-700 mb-2 lg:hidden">
                  Ontology Structure
                </h4>
                <div className="flex flex-col flex-1 lg:min-h-0  ">
                  <Tree
                    structure={formData.structure}
                    onUpdate={handleStructureUpdate}
                    onCriteriaSelect={handleCriteriaSelect}
                    onNodeSelect={handleNodeSelectAndClearCriteria}
                    selectedNodeId={selectedNode?.id}
                    invalidCriteriaIds={validationResult.invalidCriteriaIds}
                  />
                </div>
              </div>

              {/* Right Panel - Content Area */}
              <div className="order-2 lg:order-none flex flex-col space-y-4 lg:h-[500px] lg:min-h-0">
                {/* Basic Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 lg:hidden">
                    {selectedNode ? "Edit Node" : "Node Details"}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {selectedNode
                        ? `${selectedNode.type === "layer" ? "Layer" : "Criteria"} Name`
                        : "Role Name"}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="roleType"
                        value={formData.roleType}
                        onChange={(e) => {
                          handleChange(e);
                          if (selectedNode) {
                            handleNodeNameChange(e.target.value);
                          }
                        }}
                        onClick={() =>
                          selectedNode && handleNodeSelect(selectedNode)
                        }
                        onFocus={() =>
                          selectedNode && handleNodeSelect(selectedNode)
                        }
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (e.key === "Backspace" && target.value === "") {
                            e.preventDefault();
                            handleDeleteSelectedNode();
                          }
                        }}
                        placeholder={
                          selectedNode
                            ? `Enter ${selectedNode.type} name`
                            : "e.g. Senior Frontend Developer"
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                      {formData.roleType && (
                        <button
                          type="button"
                          onClick={() => handleNodeNameChange("")}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Clear name"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      {selectedNode && selectedNode.id !== "root-layer" && (
                        <button
                          onClick={handleDeleteSelectedNode}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded border border-red-300"
                          title={`Delete ${selectedNode.type}`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rules Section */}
                <div className=" rounded-lg p-4 bg-white  flex-1 flex flex-col lg:min-h-0">
                  {/* Fixed header */}
                  <div className="flex-shrink-0 mb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Rules
                        </h4>
                        <div className="flex items-center text-sm text-red-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Define rule for overall Pass' Result
                        </div>
                      </div>
                      {/* Add Rule Tree Button - Desktop only beside the text */}
                      {selectedCriteria && (
                        <div className="hidden lg:block mt-2 lg:mt-0">
                          <button
                            type="button"
                            onClick={() => handleAddRules()}
                            className="px-4 py-2 border-1 border-blue-400 text-blue-400 rounded-lg hover:bg-gray-100 text-sm font-medium flex items-center justify-center shadow-sm"
                          >
                            <PlusCircleIcon className="h-4 w-4 mr-2" />
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 lg:overflow-y-auto lg:min-h-0">
                    {selectedCriteria ? (
                      selectedCriteria.rules &&
                      selectedCriteria.rules.length > 0 ? (
                        <div className="space-y-4">
                          {selectedCriteria.rules.map((ruleTree, index) => (
                            <div
                              key={ruleTree.id}
                              className="bg-white p-3 pb-0 rounded-lg"
                            >
                              <div className="flex justify-between items-center ">
                                <h5 className="text-sm font-medium text-gray-700">
                                  Rule Tree {index + 1}
                                </h5>
                                <button
                                  onClick={() => handleDeleteRuleTree(index)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete rule tree"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div>
                                <RulesBuilder
                                  rules={ruleTree}
                                  onUpdate={(newRules) =>
                                    handleRulesUpdate(index, newRules)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="mb-4">
                            <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          </div>
                          <p className="text-sm">
                            Click "Add" below to create your first rule tree
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="mb-4">
                          <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        </div>
                        <p className="text-sm">
                          Select a criteria from the left panel to define rules
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Rule Tree Button - Mobile only at bottom */}
                  {selectedCriteria && (
                    <div className="flex-shrink-0 pt-4 border-t border-gray-200 lg:hidden">
                      <button
                        type="button"
                        onClick={() => handleAddRules()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center shadow-sm"
                      >
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        {selectedCriteria.rules &&
                        selectedCriteria.rules.length > 0
                          ? "Add Another Rule Tree"
                          : "Add Rule Tree"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Always visible at bottom for desktop */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 lg:rounded-b-lg">
              {(!validationResult.isValid || !formData.roleType.trim()) && (
                <div className="mb-3 text-sm text-red-600">
                  <div className="font-medium">Validation Errors:</div>
                  <ul className="list-disc list-inside">
                    {getFieldValidationMessage() && (
                      <li>{getFieldValidationMessage()}</li>
                    )}
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col lg:flex-row lg:justify-end space-y-2 lg:space-y-0 lg:space-x-3">
                <button
                  type="button"
                  className="w-full lg:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isFormValid()}
                  className={`w-full lg:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    !isFormValid()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  onClick={handleSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={confirmationModal.onConfirm}
        onCancel={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        type="warning"
      />
    </>
  );
};

export default OntologyModal;
