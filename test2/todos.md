# Future Ideas

## Server Actions Integration

- Add a helper to the page model that wraps Server Actions.
- Automatically revalidate relevant React Query keys upon action success.
- Allow actions to return partial state updates that are immediately merged into the client store (optimistic or confirmed updates).

## Cookie/Storage Syncing

- Implement middleware for `clientOnly` slices to automatically sync specific keys (e.g., `theme`, `sidebarCollapsed`) to cookies or localStorage.
- Ensure the _next_ request’s `buildOverrides` can read these cookies to produce a seamless server-rendered state.

## Hybrid State Machine & Simulation

- **Server Simulation**: Define the UI state machine in a shared module (agnostic of Zustand/React).
- **Validation**: On the server (or in an LLM tool-call handler), instantiate the machine with the current state, attempt a transition, and validate it before executing.
- **LLM Control**: Allow an LLM to emit "intents" or "commands" that map to state machine transitions. The server validates these against the allowed transitions for the current state (e.g., "Cannot click 'Next' if 'Form' is invalid").
- **Driven UI**: The server sends the new machine state (e.g., `step: 'review'`, `errors: []`) to the client, which mechanically renders the corresponding view. The client becomes a "dumb" renderer of the state machine.

## Partial Hydration / Islands

- Explore patterns where only specific slices of the state are hydrated for specific islands, further reducing the JS payload for complex pages.
