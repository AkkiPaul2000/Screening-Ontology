import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tree from "../components/Tree";
import { Layer } from "../types/ontology";

describe("Tree Component", () => {
  const mockOnUpdate = jest.fn();
  const mockOnCriteriaSelect = jest.fn();
  const mockOnNodeSelect = jest.fn();

  beforeEach(() => {
    // Clear mock calls before each test
    mockOnUpdate.mockClear();
    mockOnCriteriaSelect.mockClear();
    mockOnNodeSelect.mockClear();
  });

  const sampleStructure: Layer[] = [
    {
      id: "root-layer-1",
      name: "Root Layer A",
      type: "layer",
      children: [
        { id: "criteria-1", name: "Criteria X", type: "criteria" },
        {
          id: "layer-2",
          name: "Nested Layer B",
          type: "layer",
          children: [
            { id: "criteria-2", name: "Criteria Y", type: "criteria" },
          ],
        },
      ],
    },
  ];

  it("renders an empty tree when no structure is provided", () => {
    render(<Tree structure={[]} onUpdate={mockOnUpdate} />);
    expect(
      screen.getByText(/Define your ontology structure/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Layer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Criteria/i }),
    ).toBeInTheDocument();
  });

  it("renders the correct tree structure", () => {
    render(<Tree structure={sampleStructure} onUpdate={mockOnUpdate} />);
    expect(screen.getByText("Root Layer A")).toBeInTheDocument();
    expect(screen.getByText("Criteria X")).toBeInTheDocument();
    expect(screen.getByText("Nested Layer B")).toBeInTheDocument();
    expect(screen.getByText("Criteria Y")).toBeInTheDocument();
  });

  it("selects the root layer by default on initial render", () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        onNodeSelect={mockOnNodeSelect}
      />,
    );

    const rootLayerNode = screen.getByText("Root Layer A").closest("div");
    expect(rootLayerNode).toHaveClass("bg-blue-100"); // Assuming 'bg-blue-100' indicates selection
    expect(mockOnNodeSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "root-layer-1" }),
    );
  });

  it("calls onNodeSelect and onCriteriaSelect when a criteria node is clicked", () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        onCriteriaSelect={mockOnCriteriaSelect}
        onNodeSelect={mockOnNodeSelect}
      />,
    );

    const criteriaX = screen.getByText("Criteria X");
    fireEvent.click(criteriaX);

    expect(mockOnNodeSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "criteria-1", type: "criteria" }),
    );
    expect(mockOnCriteriaSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "criteria-1", type: "criteria" }),
    );
    expect(criteriaX.closest("div")).toHaveClass("bg-blue-100"); // Verify visual selection
  });

  it('adds a new layer to the root when "Add Layer" is clicked and no node is selected', () => {
    render(<Tree structure={[]} onUpdate={mockOnUpdate} />);
    const addLayerButton = screen.getByRole("button", { name: /Add Layer/i });
    fireEvent.click(addLayerButton);

    // Expect onUpdate to be called with a new structure containing a new layer
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedStructure = mockOnUpdate.mock.calls[0][0];
    expect(updatedStructure).toHaveLength(1);
    expect(updatedStructure[0].type).toBe("layer");
    expect(updatedStructure[0].name).toMatch(/New Layer/);
  });

  // ... more tests for adding criteria, expanding/collapsing, invalid criteria, etc.
});
