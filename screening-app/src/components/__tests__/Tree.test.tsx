import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tree from '../Tree';
import { Layer, Criteria } from '../../types/ontology';

describe('Tree Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnCriteriaSelect = jest.fn();
  const mockOnNodeSelect = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnCriteriaSelect.mockClear();
    mockOnNodeSelect.mockClear();
  });

  const sampleStructure: Layer[] = [
    {
      id: 'root-layer-1',
      name: 'Root Layer A',
      type: 'layer',
      children: [
        { id: 'criteria-1', name: 'Criteria X', type: 'criteria' },
        {
          id: 'layer-2',
          name: 'Nested Layer B',
          type: 'layer',
          children: [
            { id: 'criteria-2', name: 'Criteria Y', type: 'criteria' },
          ],
        },
      ],
    },
  ];

  it('renders an empty tree when no structure is provided', () => {
    render(<Tree structure={[]} onUpdate={mockOnUpdate} />);
    expect(screen.getByText(/Define your ontology structure/i)).toBeInTheDocument();
  });

  it('renders the correct tree structure', () => {
    render(<Tree structure={sampleStructure} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Root Layer A')).toBeInTheDocument();
    expect(screen.getByText('Criteria X')).toBeInTheDocument();
    expect(screen.getByText('Nested Layer B')).toBeInTheDocument();
    expect(screen.getByText('Criteria Y')).toBeInTheDocument();
  });

  it('selects the root layer by default on initial render', () => {
    render(<Tree structure={sampleStructure} onUpdate={mockOnUpdate} onNodeSelect={mockOnNodeSelect} />);

    const rootLayerText = screen.getByText('Root Layer A');
    const nodeElement = rootLayerText.closest('.px-3.py-2');
    expect(nodeElement).toHaveClass('bg-blue-100');
    expect(mockOnNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'root-layer-1' }));
  });

  it('calls onNodeSelect and onCriteriaSelect when a criteria node is clicked', () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        onCriteriaSelect={mockOnCriteriaSelect}
        onNodeSelect={mockOnNodeSelect}
      />
    );

    const criteriaXText = screen.getByText('Criteria X');
    const nodeElement = criteriaXText.closest('.px-3.py-2');
    fireEvent.click(criteriaXText);

    expect(mockOnNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'criteria-1', type: 'criteria' }));
    expect(mockOnCriteriaSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'criteria-1', type: 'criteria' }));
    expect(nodeElement).toHaveClass('bg-blue-100');
  });

  it('adds a new layer to the root when "Add Layer" is clicked', () => {
    render(<Tree structure={[]} onUpdate={mockOnUpdate} />);
    const addLayerButton = screen.getByRole('button', { name: /Add Layer/i });
    fireEvent.click(addLayerButton);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedStructure = mockOnUpdate.mock.calls[0][0];
    expect(updatedStructure).toHaveLength(1);
    expect(updatedStructure[0].type).toBe('layer');
  });

  it('adds a new criteria to a selected layer', () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        onNodeSelect={mockOnNodeSelect}
        selectedNodeId="layer-2"
      />
    );

    const addCriteriaButton = screen.getByRole('button', { name: /Add Criteria/i });
    fireEvent.click(addCriteriaButton);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedStructure = mockOnUpdate.mock.calls[0][0];
    const nestedLayer = updatedStructure[0].children.find(c => c.id === 'layer-2');
    expect(nestedLayer.children).toHaveLength(2);
    expect(nestedLayer.children[1].type).toBe('criteria');
  });

  it('disables "Add Criteria" button when a criteria is selected', () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        onNodeSelect={mockOnNodeSelect}
        selectedNodeId="criteria-1"
      />
    );

    const addCriteriaButton = screen.getByRole('button', { name: /Add Criteria/i });
    expect(addCriteriaButton).toBeDisabled();
  });

  it('highlights invalid criteria', () => {
    render(
      <Tree
        structure={sampleStructure}
        onUpdate={mockOnUpdate}
        invalidCriteriaIds={['criteria-2']}
      />
    );

    const invalidCriteriaText = screen.getByText('Criteria Y');
    const nodeElement = invalidCriteriaText.closest('.px-3.py-2');
    expect(nodeElement).toHaveClass('text-red-600');
  });
});