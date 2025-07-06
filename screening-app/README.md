# Screening Application

This project is a React application built with Vite, designed to manage and define ontologies for screening criteria.

## Table of Contents

- [Setup and Running Locally](#setup-and-running-locally)
- [Architecture Documentation](#architecture-documentation)
  - [Folder Structure](#folder-structure)
  - [Component Interaction and State Management](#component-interaction-and-state-management)
- [Thought Process Behind Key Technical Decisions](#thought-process-behind-key-technical-decisions)
  - [State Management](#state-management)
  - [Data Structures for Ontology and Rules](#data-structures-for-ontology-and-rules)
  - [Testing Strategy](#testing-strategy)
- [Challenges Faced and Solutions](#challenges-faced-and-solutions)

## Setup and Running Locally

Follow these steps to get the application running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or Yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd screening-app
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    Or using Yarn:

    ```bash
    yarn install
    ```

### Running the Application

To start the development server:

Using npm:

```bash
npm run dev
```

Or using Yarn:

```bash
yarn dev
```

### Running Tests

To run the test suite:

Using npm:

```bash
npm test
```

Or using Yarn:

```bash
yarn test
```

## Architecture Documentation

### Folder Structure

The project follows a standard React application structure, organized for clarity and scalability:

```
/screening-app
├── public/                 # Static assets
├── src/                    # Main application source code
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable UI components
│   │   ├── ConfirmationModal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── OntologyModal.tsx
│   │   ├── RulesBuilder.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Tree.tsx
│   │   └── __tests__/      # Unit tests for components
│   ├── CustomUI/           # Custom UI elements (e.g., CustomSelectField, CustomTextField)
│   │   ├── CustomSelectField.css
│   │   ├── CustomSelectField.tsx
│   │   ├── CustomTextField.css
│   │   └── CustomTextField.tsx
│   ├── pictures/           # Design mockups or reference images
│   ├── types/              # TypeScript type definitions (e.g., ontology.ts)
│   ├── utils/              # Utility functions (e.g., storage.ts, validation.ts)
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles
│   ├── main.tsx            # Entry point of the React application
│   └── setupTests.ts       # Jest setup file
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── jest.config.cjs         # Jest configuration
├── package.json            # Project metadata and dependencies
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project README
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── ...                     # Other configuration files (e.g., package-lock.json, yarn.lock)
```

### Component Interaction and State Management

The application's state management primarily relies on React's `useState` and `useEffect` hooks for local and shared component states. Data flow is generally unidirectional, from parent components to children via props.

-   **`App.tsx`**: Acts as the main layout and routing component. It manages the `activeTab` state to switch between different views (Dashboard, Candidates, etc.) and controls the visibility of the mobile sidebar and a generic `ConfirmationModal`.
-   **`Dashboard.tsx`**: This is the central hub for ontology management. It fetches and saves ontologies from/to local storage using utility functions (`storage.ts`). It manages the `ontologies` list and the `selectedOntology` state. Changes to the ontology structure are propagated up to `Dashboard.tsx` via `onUpdate` props from `Tree.tsx`.
-   **`OntologyModal.tsx`**: A complex modal responsible for creating and editing ontology structures. It manages its own form data (`formData`), selected nodes (`selectedNode`), and selected criteria (`selectedCriteria`). It interacts with `Tree.tsx` and `RulesBuilder.tsx` to display and modify the ontology structure and rules. Validation logic is integrated to ensure data integrity before saving.
-   **`Tree.tsx`**: A recursive component that renders the hierarchical structure of an ontology (layers and criteria). It receives the `structure` data as a prop and provides `onUpdate` callbacks to its parent (`OntologyModal.tsx`) when nodes are added, deleted, or updated. It also handles node selection and visual feedback for invalid nodes.
-   **`RulesBuilder.tsx`**: Dedicated to building and managing rules for a selected `Criteria`. It receives a `RuleGroup` object and provides an `onUpdate` callback to `OntologyModal.tsx` when rules or nested groups are modified. It handles adding/removing rule statements and nested rule groups.
-   **`CustomUI/` components**: These are generic, reusable UI components (e.g., text fields, select fields) that encapsulate their own internal state (e.g., focus, open/closed state for select). They expose `value` and `onChange` props for controlled component patterns, allowing parent components to manage their data.

**State Flow Example (Editing an Ontology Name):**

1.  User types in the "Layer/Criteria Name" `CustomTextField` in `OntologyModal.tsx`.
2.  `CustomTextField`'s `onChange` is triggered, passing the new value to `OntologyModal.tsx`.
3.  `OntologyModal.tsx`'s `handleChange` updates its `formData.roleType` state.
4.  `handleNodeNameChange` in `OntologyModal.tsx` is called, which updates the `name` property of the `selectedNode` within the `formData.structure`.
5.  `OntologyModal.tsx` then calls `setFormData` with the updated structure, triggering a re-render.
6.  The `Tree.tsx` component, receiving the updated `formData.structure`, re-renders to reflect the name change.
7.  The `useEffect` hook in `OntologyModal.tsx` (which watches `formData.structure`) re-validates the entire ontology, updating `validationResult` and potentially enabling/disabling the "Save" button.

## Thought Process Behind Key Technical Decisions

### State Management

The decision to primarily use React's built-in `useState` and `useEffect` hooks for state management was driven by several factors:

-   **Simplicity for the Application's Scale:** For a medium-sized application like this, a dedicated state management library (like Redux or Zustand) would introduce unnecessary boilerplate and complexity. React hooks provide sufficient power and flexibility for managing both local component state and shared state through prop drilling or React Context (though Context was not extensively used here, it remains an option for future growth).
-   **Directness and Readability:** Managing state directly within components using `useState` often leads to more readable and understandable code, especially for developers familiar with React. The state updates are explicit and localized.
-   **Performance Considerations:** For most UI updates, React's reconciliation algorithm is highly optimized. Over-engineering with complex state management patterns can sometimes lead to premature optimization or even hinder performance if not implemented carefully.

### Data Structures for Ontology and Rules

The choice of data structures for representing the ontology and its rules (`ontology.ts`) was crucial for both functionality and maintainability:

-   **Tree-like Structure for Ontology (`Layer` and `Criteria`):** A recursive, tree-like structure was chosen to naturally represent the hierarchical nature of the ontology.
    -   `Layer` objects can contain an array of `children` which can be either `Layer` or `Criteria` nodes. This allows for arbitrary nesting depth.
    -   `Criteria` objects are leaf nodes that contain an array of `RuleGroup` objects.
    -   Each node (`Layer` or `Criteria`) has a unique `id` for easy identification and manipulation within the tree.
-   **Recursive `RuleGroup` for Rules:** The `RuleGroup` interface is also recursive, allowing for complex nested rule logic (e.g., `(A AND B) OR (C AND D)`).
    -   Each `RuleGroup` has a `condition` (`"AND"` or `"OR"`) and an array of `statements`.
    -   Crucially, `RuleGroup` can also contain an array of nested `groups`, enabling the recursive structure.
    -   `RuleStatement` objects are the atomic units of a rule, defining a `property`, `operator`, and `value`.

This design directly maps to the problem domain of building flexible screening criteria and allows for easy traversal and manipulation of the data. The use of TypeScript interfaces provides strong typing, which significantly reduces runtime errors and improves developer experience.

### Testing Strategy

The testing strategy focuses on unit and integration tests using `@testing-library/react` and Jest:

-   **Jest for Test Runner and Assertions:** Jest was chosen for its widespread adoption in the React ecosystem, its powerful assertion library, and its excellent developer experience (e.g., watch mode, clear error messages).
-   **`@testing-library/react` for Component Testing:** This library promotes testing components in a way that mimics how users interact with them. Instead of testing internal component state or implementation details, it encourages querying the DOM for elements visible to the user and simulating user events. This leads to more robust tests that are less likely to break due to internal refactors.
-   **Mocking External Dependencies:** For components that rely on external modules (like `CustomTextField` importing CSS or `clsx`), Jest's mocking capabilities were used. This isolates the component under test and ensures that tests run quickly and reliably without external side effects.
-   **Comprehensive Test Coverage:** Efforts were made to cover various scenarios for key components like `Tree.tsx` and `RulesBuilder.tsx`, including:
    -   Initial rendering with different data states (empty, populated).
    -   User interactions (clicking, typing, changing selections).
    -   Adding, updating, and deleting elements within the complex data structures.
    -   Validation feedback and disabled states.

This strategy aims to provide confidence that individual components work as expected and that their interactions contribute to a correct overall application flow.

## Challenges Faced and Solutions

During the development of this application, several challenges were encountered, particularly related to state management, complex UI interactions, and testing.

### 1. Managing Deeply Nested and Recursive Data Structures

**Challenge:** The core of this application revolves around managing a deeply nested and recursive data structure for the ontology (layers and criteria) and the rules within criteria. Direct mutation of these objects can lead to unpredictable behavior and make state updates difficult to track in React.

**Solution:**
-   **Immutability:** All state updates involving the ontology structure and rules are performed immutably. This means that instead of directly modifying existing objects, new objects are created with the desired changes. While this can sometimes lead to more verbose code (e.g., using `map` and spread operators extensively), it ensures predictable state changes and simplifies debugging. `JSON.parse(JSON.stringify(obj))` was occasionally used for deep cloning when a completely new, disconnected copy of a nested object was required.
-   **Recursive Functions for Traversal and Updates:** Helper functions were implemented to recursively traverse and update the nested `TreeNode` and `RuleGroup` structures. This abstracted away the complexity of finding and modifying specific nodes deep within the tree.

### 2. Synchronizing UI with Complex State Changes

**Challenge:** Ensuring the UI accurately reflects the underlying complex data structure, especially during additions, deletions, and updates, was challenging. For instance, when a criteria node is deleted, the selection should ideally shift to its parent or a logical fallback. Similarly, changes in node names needed to propagate correctly to the main form.

**Solution:**
-   **Centralized State Updates:** All modifications to the ontology structure are funneled through a single `onUpdate` callback in the `Tree` component, which then updates the main `formData` state in `OntologyModal.tsx`. This ensures a single source of truth.
-   **`useEffect` for Side Effects and Derived State:** `useEffect` hooks were strategically used to react to changes in `formData.structure` and `selectedNode`. For example, the `validationResult` is re-calculated whenever the structure changes, and the `roleType` in the form is automatically updated to match the `selectedNode.name`.
-   **Careful Selection Management:** Logic was implemented to intelligently manage `selectedNode` and `selectedCriteria` states, ensuring that when a selected node is deleted, a sensible alternative (like its parent or the root layer) is automatically selected.

### 3. Implementing Dynamic Visual Connectors for Tree and Rules Builder

**Challenge:** Creating the visual lines and connectors for the tree view (`Tree.tsx`) and the rules builder (`RulesBuilder.tsx`) to accurately represent the hierarchical relationships was a significant UI/CSS challenge. Overlapping lines, incorrect positioning, and responsiveness were key concerns.

**Solution:**
-   **Absolute Positioning and Relative Containers:** A combination of `position: relative` on parent containers and `position: absolute` on the line elements was used. This allowed precise control over the placement of lines relative to their parent nodes.
-   **Conditional Class Names (`clsx`):** The `clsx` library was invaluable for dynamically applying CSS classes based on component state (e.g., `isLast` to adjust line height for the last child in a list).
-   **Iterative Refinement:** The line drawing logic required several iterations and careful adjustment of pixel values and percentages to achieve the desired visual effect across different nesting levels and screen sizes. Debugging with browser developer tools was essential here.

### 4. Robust Testing of UI Interactions and State Logic

**Challenge:** Testing components with complex state logic and intricate user interactions can be brittle and difficult to set up. Mocking dependencies and simulating user events accurately was crucial.

**Solution:**
-   **`@testing-library/react`:** This library's philosophy of testing "how users interact" proved highly effective. Instead of relying on internal component state, tests query the DOM for elements visible to the user (e.g., `getByText`, `getByRole`) and simulate events (`fireEvent.click`, `fireEvent.change`). This makes tests more resilient to refactors.
-   **Jest Mocks for Custom Components:** Custom components like `CustomTextField` and `CustomSelectField` were mocked in Jest. This allowed tests for `OntologyModal` and `RulesBuilder` to focus solely on their logic without needing to render the full complexity of the custom UI elements. The mocks were carefully crafted to expose the necessary props (`value`, `onChange`, `onClear`) for testing.
-   **Clear and Concise Test Cases:** Each test case was designed to focus on a single piece of functionality, making it easier to identify and debug failures.
-   **Addressing Jest Configuration for CSS and ES Modules:** Initial challenges with Jest's module resolution for CSS imports and ES module imports (like `clsx`) were resolved by correctly configuring `moduleNameMapper` and `transformIgnorePatterns` in `jest.config.cjs`. This ensured that the test environment correctly processed all necessary files.

These challenges, while demanding, led to a deeper understanding of React's rendering lifecycle, state management patterns, and effective testing methodologies.
