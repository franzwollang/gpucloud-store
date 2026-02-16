# Hybrid Validation & State Machine Pattern

This directory contains a proof-of-concept for a "Hybrid Validation" system that generalizes into a server-driven State Machine pattern. It addresses the challenge of combining instant client-side feedback with authoritative server-side logic.

## Core Concepts

### 1. Hybrid Validation
- **Client-Side Speed**: Uses `react-hook-form` and `zod` for immediate feedback on simple constraints (required fields, formats).
- **Server-Side Authority**: Uses Server Actions to perform deep validation (DB checks, business rules) that the client cannot do.
- **Synchronization**: A mechanism (`clientSync.tsx`) to map server-side validation errors back to the client's form state, ensuring the UI always reflects the "true" state of the transaction.

### 2. The "Hybrid Machine" (Generalization)
We are evolving this validation pattern into a generic State Machine (`useHybridMachine`):
- **State**: The UI is a reflection of a state machine (e.g., `idle` -> `validating` -> `success` | `error`).
- **Transitions**: User actions trigger Server Actions, which attempt to transition the machine.
- **Simulation**: The server "simulates" the transition. If valid, it commits and returns the new state; if invalid, it returns errors.
- **Adapters**: Client-side adapters listen for state changes to trigger side effects (e.g., "On `REJECTED`, map errors to Form inputs").

## Key Files

- **`actions.tsx`**: Server Actions acting as the "transition handlers."
- **`clientSync.tsx`**: Logic for bridging server responses to client UI (e.g., RHF `setError`).
- **`useServerAction.tsx`**: A custom hook (precursor to React 19's `useActionState`) for managing the async transition lifecycle.
- **`page.tsx`**: The view layer that binds the form, the action, and the sync logic together.

## Future Direction: LLM Tool Calls
This pattern is foundational for reliable LLM-driven UIs:
- **LLM as User**: An LLM can emit "tool calls" that act as state transitions.
- **Safety**: Because the state machine logic lives on the server, we can validate LLM actions against the current state (e.g., "LLM cannot submit form if step is 'review'").
- **Determinism**: The UI becomes a deterministic projection of the machine state, whether driven by a human click or an AI command.
