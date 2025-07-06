import React, { useState, useEffect } from "react";
import { TreeNode, Layer, Criteria } from "../types/ontology";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

interface TreeProps {
  structure: TreeNode[];
  onUpdate: (newStructure: TreeNode[]) => void;
  onCriteriaSelect?: (criteria: Criteria) => void;
  onNodeSelect?: (node: TreeNode | null) => void;
  selectedNodeId?: string;
  invalidCriteriaIds?: string[];
}

interface NodeComponentProps {
  node: TreeNode;
  onAddLayer: (parent: TreeNode | null) => void;
  onAddCriteria: (parent: TreeNode) => void;
  onUpdateNode: (node: TreeNode, updates: any) => void;
  onCriteriaSelect?: (criteria: Criteria) => void;
  onNodeSelect?: (node: TreeNode) => void;
  isSelected?: boolean;
  invalidCriteriaIds?: string[];
  selectedNodeId?: string;
  isLast?: boolean;
  isRoot?: boolean;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  onAddLayer,
  onAddCriteria,
  onUpdateNode,
  onCriteriaSelect,
  onNodeSelect,
  isSelected = false,
  invalidCriteriaIds = [],
  selectedNodeId,
  isLast = false,
  isRoot = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => setIsExpanded(!isExpanded);
  const handleClick = () => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
    if (node.type === "criteria" && onCriteriaSelect) {
      onCriteriaSelect(node as Criteria);
    }
  };

  const isInvalid =
    (node.type === "criteria" && invalidCriteriaIds.includes(node.id)) || !node.name.trim();

  const hasChildren =
    node.type === "layer" &&
    (node as Layer).children &&
    (node as Layer).children.length > 0;

  return (
    <div className="relative">
      {/* Vertical line from parent */}
      {!isRoot && (
        <div
          className={`absolute left-[10px] top-0 w-[2px] bg-gray-300 ${isLast ? "h-[40px]" : "h-full"}`}
        ></div>
      )}
      {/* Horizontal line to current node */}
      {!isRoot && (
        <div className="absolute left-[11px] top-[38px] w-[13px] h-[2px] bg-gray-300"></div>
      )}

      <div className="flex items-start relative z-10">
        {/* Toggle button for layers with children */}
        <div className="flex-shrink-0 mr-0 mt-7">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4"></div>
          )}
        </div>

        {/* Node content */}
        <div className="flex-1">
          {/* Type heading */}
          <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            {node.type === "layer" ? "Layer" : "Criteria"}
          </div>
          {/* Node name with selection */}
          <div
            className={`px-3 py-2 rounded cursor-pointer text-sm transition-colors flex ${
              isSelected
                ? "bg-blue-100 text-blue-900 border border-blue-200"
                : isInvalid
                  ? "text-red-600 hover:bg-red-50 border border-red-200"
                  : "text-gray-700 hover:bg-gray-100 border border-transparent"
            }`}
            onClick={handleClick}
            data-selected={isSelected}
            data-invalid={isInvalid}
          >
            {/* 6 dots (using 6 divs) */}
            <div className="flex-shrink-0 mr-3 mt-[2px]">
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <span className="font-medium">
              {node.name ||
                (node.type === "layer" ? "Layer name" : "Criteria name")}
            </span>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative pl-8">
          {(node as Layer).children.map((child, index) => (
            <NodeComponent
              key={child.id}
              node={child}
              onAddLayer={onAddLayer}
              onAddCriteria={onAddCriteria}
              onUpdateNode={onUpdateNode}
              onCriteriaSelect={onCriteriaSelect}
              onNodeSelect={onNodeSelect}
              isSelected={selectedNodeId === child.id}
              isLast={index === (node as Layer).children.length - 1}
              isRoot={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const Tree: React.FC<TreeProps> = ({
  structure,
  onUpdate,
  onCriteriaSelect,
  onNodeSelect,
  selectedNodeId,
  invalidCriteriaIds = [],
}) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.type === "layer") {
        const found = findNodeById((node as Layer).children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const currentSelectedNode = selectedNodeId
    ? findNodeById(structure, selectedNodeId)
    : selectedNode;

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Set root layer as selected by default when structure changes
  useEffect(() => {
    if (structure.length > 0) {
      const rootLayer = structure.find((node) => node.id === "root-layer");
      if (rootLayer) {
        // Always select root layer on initial render or when there's no selection
        if (!currentSelectedNode || !selectedNodeId) {
          handleNodeSelect(rootLayer);
        }
      }
    }
  }, [structure, currentSelectedNode, selectedNodeId]);

  const addLayer = (parent: TreeNode | null) => {
    // Don't allow adding multiple root layers
    if (!parent && structure.length > 0) {
      console.log("Attempted to add multiple root layers, returning.");
      return;
    }

    // Generate proper layer name based on existing siblings
    const generateLayerName = (parent: TreeNode | null): string => {
      const siblings = parent ? (parent as Layer).children : structure;
      const existingLayers = siblings.filter((child) => child.type === "layer");

      if (existingLayers.length === 0) {
        return "New Layer";
      }

      // Find the highest number used in existing layer names
      let maxNumber = 0;
      let hasBaseName = false;

      existingLayers.forEach((layer) => {
        if (layer.name === "New Layer") {
          hasBaseName = true;
        } else {
          const match = layer.name.match(/New Layer\s*\((\d+)\)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });

      // Return the next number in sequence: first -> name, then -> name(1), name(2)...
      if (!hasBaseName) {
        return "New Layer";
      } else if (maxNumber === 0) {
        return "New Layer (1)";
      } else {
        return `New Layer (${maxNumber + 1})`;
      }
    };

    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: generateLayerName(parent),
      type: "layer",
      children: [],
    };

    if (parent && parent.type === "layer") {
      (parent as Layer).children.push(newLayer);
    } else {
      structure.push(newLayer);
    }
    onUpdate([...structure]);
  };

  const addCriteria = (parent: TreeNode) => {
    if (parent.type !== "layer") return;

    // Generate proper criteria name based on existing siblings
    const generateCriteriaName = (parent: TreeNode): string => {
      const siblings = (parent as Layer).children;
      const existingCriteria = siblings.filter(
        (child) => child.type === "criteria",
      );

      if (existingCriteria.length === 0) {
        return "Criteria";
      }

      // Find the highest number used in existing criteria names
      let maxNumber = 0;
      let hasBaseName = false;

      existingCriteria.forEach((criteria) => {
        if (criteria.name === "Criteria") {
          hasBaseName = true;
        } else {
          const match = criteria.name.match(/Criteria\s*\((\d+)\)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });

      // Return the next number in sequence: first -> name, then -> name(1), name(2)...
      if (!hasBaseName) {
        return "Criteria";
      } else if (maxNumber === 0) {
        return "Criteria (1)";
      } else {
        return `Criteria (${maxNumber + 1})`;
      }
    };

    const newCriteria: Criteria = {
      id: crypto.randomUUID(),
      name: generateCriteriaName(parent),
      type: "criteria",
    };
    (parent as Layer).children.push(newCriteria);
    onUpdate([...structure]);
  };

  const updateNode = (node: TreeNode, updates: any) => {
    Object.assign(node, updates);
    onUpdate([...structure]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Tree Structure */}
      <div className="flex-1 lg:overflow-y-auto lg:max-h-[500px] py-3 ">
        {structure.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Define your ontology structure by adding layers and criteria
          </div>
        ) : (
          <div className="space-y-6">
            {structure.map((node, index) => (
              <NodeComponent
                key={node.id}
                node={node}
                onAddLayer={addLayer}
                onAddCriteria={addCriteria}
                onUpdateNode={updateNode}
                onCriteriaSelect={onCriteriaSelect}
                onNodeSelect={(node: TreeNode) => handleNodeSelect(node)}
                isSelected={selectedNodeId === node.id}
                invalidCriteriaIds={invalidCriteriaIds}
                selectedNodeId={selectedNodeId}
                isLast={index === structure.length - 1}
                isRoot={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fixed Action Buttons - Always visible */}
      <div className="flex-shrink-0  pt-3 mt-3 bg-white">
        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
          <button
            onClick={() => {
              if (currentSelectedNode?.type === "layer") {
                addLayer(currentSelectedNode);
              } else {
                addLayer(null);
              }
            }}
            className={`w-full lg:flex-1 px-3 py-2 rounded text-sm flex justify-center items-center ${currentSelectedNode?.type === "criteria" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "border border-blue-300 text-blue-600 hover:bg-blue-50"}`}
            disabled={currentSelectedNode?.type === "criteria"}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Layer
          </button>
          <button
            onClick={() => {
              if (currentSelectedNode?.type === "layer") {
                addCriteria(currentSelectedNode);
              }
            }}
            className={`w-full lg:flex-1 px-3 py-2 rounded text-sm flex justify-center items-center ${currentSelectedNode?.type === "criteria" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "border border-purple-300 text-purple-600 hover:bg-purple-50"}`}
            disabled={currentSelectedNode?.type === "criteria"}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Criteria
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tree;
