import React from "react";
import { RuleGroup, RuleStatement } from "../types/ontology";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import CustomSelectField from "../CustomUI/CustomSelectField";
import CustomTextField from "../CustomUI/CustomTextField";
import { clsx } from "clsx";

// --- PROPS INTERFACES ---
interface RulesBuilderProps {
  rules?: RuleGroup;
  onUpdate: (newRules: RuleGroup) => void;
}

interface RuleGroupComponentProps {
  group: RuleGroup;
  onUpdate: (group: RuleGroup) => void;
  onDelete?: () => void;
  isRoot?: boolean;
  isLastChild?: boolean;
}

interface StatementComponentProps {
  statement: RuleStatement;
  onUpdate: (statement: RuleStatement) => void;
  onDelete: () => void;
  isLastChild?: boolean;
}

// --- CONSTANTS ---
const options = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
];

const operators = [
  "Greater Than",
  "Less Than",
  "Equals",
  "Contains",
  "Is Empty",
  "Is Not Empty",
] as const;

// --- STATEMENT COMPONENT ---
const StatementComponent: React.FC<StatementComponentProps> = ({
  statement,
  onUpdate,
  onDelete,
  isLastChild,
}) => {
  return (
    <div className="relative pl-4 left-6 ">
      {/* Vertical line from parent group's line */}
      <div
        className={clsx(
          "absolute left-0 -top-5 lg:bottom-5 w-[2px] bg-gray-300 ",
          isLastChild ? " h-12 " : "h-full",
        )}
      ></div>
      {!isLastChild && (
        <div className="absolute -left-0 top-[13.6rem] mt-0 h-5 w-[2px] bg-gray-300 lg:hidden" />
      )}
      {/* Horizontal line to this statement */}
      <div className="absolute left-0 top-7 w-4 h-[2px] bg-gray-300"></div>

      <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-end lg:space-x-3">
        <div className="flex items-center w-full lg:w-40 mr-6">
          <div className="flex-shrink-0 mr-1 mt-0">
            <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-300 rounded-full"></div>
              ))}
            </div>
          </div>
          <CustomTextField
            label="Property"
            value={statement.property}
            onChange={(value) => onUpdate({ ...statement, property: value })}
            placeholder="Experience"
          />
        </div>
        <div className="flex flex-col w-full lg:w-40">
          <CustomSelectField
            label="Operator"
            value={statement.operator}
            onChange={(value) =>
              onUpdate({ ...statement, operator: value as any })
            }
            options={operators.map((op) => ({ value: op, label: op }))}
          />
        </div>
        <div className="flex flex-col w-full lg:w-32">
          <CustomTextField
            label="Value"
            value={statement.value}
            onChange={(value) => onUpdate({ ...statement, value: value })}
            placeholder="3"
          />
        </div>
        <div className="flex justify-self-center lg:block">
          <button
            onClick={onDelete}
            className="w-full lg:w-auto px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded border border-red-300 text-sm lg:text-xs"
            title="Delete rule"
          >
            <TrashIcon className="h-4 w-4 mx-auto lg:mx-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- RULE GROUP COMPONENT ---
const RuleGroupComponent: React.FC<RuleGroupComponentProps> = ({
  group,
  onUpdate,
  onDelete,
  isRoot = false,
  isLastChild = false,
}) => {
  const updateGroup = (g: RuleGroup) => onUpdate(g);

  const addStatement = () => {
    const newStatement: RuleStatement = {
      id: crypto.randomUUID(),
      property: "",
      operator: "Equals",
      value: "",
    };
    updateGroup({ ...group, statements: [...group.statements, newStatement] });
  };

  const updateStatement = (index: number, statement: RuleStatement) => {
    const updatedStatements = [...group.statements];
    updatedStatements[index] = statement;
    updateGroup({ ...group, statements: updatedStatements });
  };

  const deleteStatement = (index: number) => {
    updateGroup({
      ...group,
      statements: group.statements.filter((_, i) => i !== index),
    });
  };

  const addGroup = () => {
    const newGroup: RuleGroup = {
      id: crypto.randomUUID(),
      condition: "AND",
      statements: [],
      groups: [],
    };
    updateGroup({ ...group, groups: [...(group.groups || []), newGroup] });
  };

  const updateSubGroup = (index: number, updatedGroup: RuleGroup) => {
    if (!group.groups) return;
    const updatedGroups = [...group.groups];
    updatedGroups[index] = updatedGroup;
    updateGroup({ ...group, groups: updatedGroups });
  };

  const deleteSubGroup = (index: number) => {
    if (!group.groups) return;
    updateGroup({
      ...group,
      groups: group.groups.filter((_, i) => i !== index),
    });
  };

  const allChildren = [
    ...(group.statements || []).map((s) => ({
      type: "statement" as const,
      data: s,
    })),
    ...(group.groups || []).map((g) => ({ type: "group" as const, data: g })),
  ];

  return (
    <div className={clsx("w-full ", !isRoot && "relative pl-22 ")}>
      {!isRoot && (
        <>
          <div
            className={clsx(
              "absolute left-6 -top-10 lg:-top-6 w-[2px] bg-gray-300",
              isLastChild ? " h-24 lg:h-20" : "h-full",
            )}
          ></div>
          <div className="absolute left-6 top-14 w-16 h-[2px] bg-gray-300"></div>
        </>
      )}

      <div className="flex items-center justify-between ">
        <div className="pb-4 mt-8 w-full lg:w-40 ">
          <CustomSelectField
            label="Condition"
            value={group.condition}
            onChange={(value) =>
              updateGroup({ ...group, condition: value as "AND" | "OR" })
            }
            options={options}
          />
        </div>
        {!isRoot && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative">
        {/* {allChildren.length > 1 && (
          <div className="absolute left-0 top-0 h-[100px] w-px bg-gray-300"></div>
        )} */}
        <div className="space-y-4 lg:space-y-0">
          {allChildren.map((child, index) => {
            const isLast = index === allChildren.length - 1;
            if (child.type === "statement") {
              const statementIndex = group.statements.findIndex(
                (s) => s.id === child.data.id,
              );
              return (
                <StatementComponent
                  key={child.data.id}
                  statement={child.data}
                  onUpdate={(stmt) => updateStatement(statementIndex, stmt)}
                  onDelete={() => deleteStatement(statementIndex)}
                  isLastChild={isLast}
                />
              );
            } else {
              // child.type === 'group'
              const groupIndex = (group.groups || []).findIndex(
                (g) => g.id === child.data.id,
              );
              return (
                <RuleGroupComponent
                  key={child.data.id}
                  group={child.data}
                  onUpdate={(g) => updateSubGroup(groupIndex, g)}
                  onDelete={() => deleteSubGroup(groupIndex)}
                  isRoot={false}
                  isLastChild={isLast}
                />
              );
            }
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
        <button
          onClick={addStatement}
          className="flex items-center justify-center px-3 py-2 text-blue-700 rounded hover:bg-blue-100 text-sm w-full lg:w-auto"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Condition
        </button>
        <button
          onClick={addGroup}
          className="flex items-center justify-center px-3 py-2 text-blue-700 rounded hover:bg-blue-100 text-sm w-full lg:w-auto"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Group
        </button>
      </div>
    </div>
  );
};

// --- MAIN BUILDER COMPONENT ---
const RulesBuilder: React.FC<RulesBuilderProps> = ({ rules, onUpdate }) => {
  if (!rules) return null;

  // Ensure root has a groups array
  const safeRules = {
    ...rules,
    groups: rules.groups || [],
  };

  return (
    <div className="w-full flex">
      <div className="flex flex-1">
        <RuleGroupComponent
          group={safeRules}
          onUpdate={onUpdate}
          isRoot={true}
        />
      </div>
    </div>
  );
};

export default RulesBuilder;
