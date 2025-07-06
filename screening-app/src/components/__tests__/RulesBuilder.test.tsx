import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RulesBuilder from '../RulesBuilder';
import { RuleGroup } from '../../types/ontology';

// Mock CustomTextField to accept onClear prop
jest.mock('/home/akki/Codes/personal/screening-app/src/CustomUI/CustomTextField', () => {
  return ({ label, value, onChange, placeholder, onClear }) => (
    <input
      data-testid="custom-textfield"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      data-onclear={onClear ? "true" : "false"}
    />
  );
});

jest.mock('/home/akki/Codes/personal/screening-app/src/CustomUI/CustomSelectField', () => {
  return ({ label, value, onChange, options }) => (
    <select
      data-testid="custom-selectfield"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

describe('RulesBuilder Component', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  const sampleRules: RuleGroup = {
    id: 'root',
    condition: 'AND',
    statements: [
      {
        id: 's1',
        property: 'Experience',
        operator: 'Greater Than',
        value: '5',
      },
    ],
    groups: [
      {
        id: 'g1',
        condition: 'OR',
        statements: [
          {
            id: 's2',
            property: 'Skill',
            operator: 'Equals',
            value: 'React',
          },
        ],
        groups: [],
      },
    ],
  };

  it('renders the initial rules correctly', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    expect(screen.getByDisplayValue('Experience')).toBeInTheDocument();
    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('adds a new rule statement', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const addRuleButtons = screen.getAllByRole('button', { name: /Add Rule/i });
    fireEvent.click(addRuleButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.statements).toHaveLength(2);
  });

  it('removes a rule statement', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const deleteButtons = screen.getAllByRole('button', { title: /Delete rule/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.statements).toHaveLength(0);
  });

  it('adds a new rule group', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const addGroupButtons = screen.getAllByRole('button', { name: /Add Group/i });
    fireEvent.click(addGroupButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.groups).toHaveLength(2);
  });

  it('removes a rule group', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const deleteButtons = screen.getAllByRole('button', { name: /TrashIcon/i });
    fireEvent.click(deleteButtons[1]); // Assuming the second trash icon is for the group

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.groups).toHaveLength(0);
  });

  it('updates a rule statement', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const propertyInput = screen.getByDisplayValue('Experience');
    fireEvent.change(propertyInput, { target: { value: 'Age' } });

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.statements[0].property).toBe('Age');
  });

  it('changes the condition of a rule group', () => {
    render(<RulesBuilder rules={sampleRules} onUpdate={mockOnUpdate} />);

    const conditionField = screen.getByText('AND').closest('.custom-select-field');
    fireEvent.click(conditionField);
    fireEvent.click(screen.getByRole('option', { name: 'OR' }));

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedRules = mockOnUpdate.mock.calls[0][0];
    expect(updatedRules.condition).toBe('OR');
  });
});