export interface RuleStatement {
  id: string;
  property: string;
  operator:
    | "Greater Than"
    | "Less Than"
    | "Equals"
    | "Contains"
    | "Is Empty"
    | "Is Not Empty";
  value: string;
}

export interface RuleGroup {
  id: string;
  condition: "AND" | "OR";
  statements: RuleStatement[];
  groups?: RuleGroup[];
}

export interface Criteria {
  id: string;
  name: string;
  type: "criteria";
  rules?: RuleGroup[];
}

export interface Layer {
  id: string;
  name: string;
  type: "layer";
  children: (Layer | Criteria)[];
}

export interface Ontology {
  id: string;
  roleType: string;
  description: string;
  createdOn: string;
  createdBy: string;
  structure: (Layer | Criteria)[];
}

export type TreeNode = Layer | Criteria;

export interface OntologyFormData {
  roleType: string;
  description: string;
  structure: (Layer | Criteria)[];
}
