import { Ontology } from "../types/ontology";

const STORAGE_KEY = "screening_ontologies";

export const loadOntologies = (): Ontology[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading ontologies:", error);
    return [];
  }
};

export const saveOntologies = (ontologies: Ontology[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ontologies));
  } catch (error) {
    console.error("Error saving ontologies:", error);
  }
};

export const saveOntology = (ontology: Ontology): void => {
  const ontologies = loadOntologies();
  const existingIndex = ontologies.findIndex((o) => o.id === ontology.id);

  if (existingIndex >= 0) {
    ontologies[existingIndex] = ontology;
  } else {
    ontologies.push(ontology);
  }

  saveOntologies(ontologies);
};

export const deleteOntology = (id: string): void => {
  const ontologies = loadOntologies();
  const filtered = ontologies.filter((o) => o.id !== id);
  saveOntologies(filtered);
};

export const duplicateOntology = (ontology: Ontology): Ontology => {
  const ontologies = loadOntologies();

  // Find similar names to generate unique name
  const baseName = ontology.roleType;
  const similarNames = ontologies
    .filter((o) => o.roleType.startsWith(baseName))
    .map((o) => o.roleType);

  let newName = baseName;
  let counter = 1;

  while (similarNames.includes(newName)) {
    newName = `${baseName} (${counter})`;
    counter++;
  }

  const duplicated: Ontology = {
    ...ontology,
    id: crypto.randomUUID(),
    roleType: newName,
    createdOn: new Date().toISOString(),
  };

  return duplicated;
};
