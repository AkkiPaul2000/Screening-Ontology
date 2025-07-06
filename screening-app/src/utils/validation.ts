import {
  RuleGroup,
  RuleStatement,
  TreeNode,
  Criteria,
} from "../types/ontology";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  invalidCriteriaIds: string[];
}

export const validateRuleStatement = (statement: RuleStatement): boolean => {
  return !!(
    statement.property?.trim() &&
    statement.operator &&
    statement.value?.trim()
  );
};

export const validateRuleGroup = (group: RuleGroup): boolean => {
  if (!group) return false;

  // Check if all statements (groups) are valid
  const validStatements = group.statements.filter(validateRuleStatement);

  // Total children = valid groups + nested conditions
  const totalChildren = validStatements.length + (group.groups?.length || 0);

  // A condition (AND/OR) must have at least 2 children
  if (totalChildren < 2) {
    return false;
  }

  // All nested conditions must also be valid
  if (group.groups && group.groups.length > 0) {
    return group.groups.every(validateRuleGroup);
  }

  return true;
};

export const validateCriteria = (criteria: Criteria): boolean => {
  if (!criteria.rules) return true; // No rules is valid (user hasn't added any yet)
  return criteria.rules.every(validateRuleGroup);
};

export const getDetailedValidationErrors = (
  statement: RuleStatement,
): string[] => {
  const errors: string[] = [];
  if (!statement.property?.trim()) {
    errors.push(`Property field is required`);
  }
  if (!statement.operator) {
    errors.push(`Operator field is required`);
  }
  if (!statement.value?.trim()) {
    errors.push(`Value field is required`);
  }
  return errors;
};

export const validateOntologyStructure = (
  structure: TreeNode[],
): ValidationResult => {
  const errors: string[] = [];
  const invalidCriteriaIds: string[] = [];

  const validateNode = (node: TreeNode): void => {
    // Check for empty name for all nodes
    if (!node.name.trim()) {
      errors.push(`Name for ${node.type} cannot be empty.`);
      invalidCriteriaIds.push(node.id); // Use invalidCriteriaIds for any invalid node for now
    }

    if (node.type === "criteria") {
      const criteria = node as Criteria;
      // If criteria has rules, validate them
      if (criteria.rules && criteria.rules.length > 0) {
        if (!validateCriteria(criteria)) {
          errors.push(`Rules for criteria "${criteria.name}" are invalid.`);
          invalidCriteriaIds.push(criteria.id);
        }
      } else if (criteria.rules === undefined || criteria.rules.length === 0) {
        // If criteria has no rules, it's considered valid for now, but could be flagged if required to have rules
      }
    } else if (node.type === "layer") {
      const layer = node as any;
      if (layer.children) {
        layer.children.forEach(validateNode);
      }
    }
  };

  structure.forEach(validateNode);

  return {
    isValid: errors.length === 0,
    errors,
    invalidCriteriaIds,
  };
};

export const getRuleValidationMessage = (group: RuleGroup): string => {
  if (!group) return "No rules defined";

  const validStatements = group.statements.filter(validateRuleStatement);
  const totalChildren = validStatements.length + (group.groups?.length || 0);

  if (totalChildren < 2) {
    return "Each condition (AND/OR) requires at least 2 children";
  }

  const invalidStatements = group.statements.filter(
    (s) => !validateRuleStatement(s),
  );
  if (invalidStatements.length > 0) {
    return "Some groups are incomplete";
  }

  return "";
};

export const validateRuleTrees = (ruleTrees: RuleGroup[]): boolean => {
  if (!ruleTrees || ruleTrees.length === 0) return true;
  return ruleTrees.every(validateRuleGroup);
};
