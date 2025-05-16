# Chapter 3 – Distributed Without Tears

**Goal**: Run two independent services on separate ports, each with its own graph, and demonstrate how to delegate execution across services using `DeputyTask`. Trigger the flow using an `Agent`.

---

## Overview

You’ll build:
- **Service A**: Hosts a local graph and starts the flow
- **Service B**: Hosts a subroutine and runs on a different port

---

## Service B: Analysis Service (Port 3000)

```ts
import ProcessingGraph from 'processing-graph';

const analyze = ProcessingGraph.createTask((ctx) => {
  ctx.analysis = `Analysis complete for: ${ctx.input}`;
  return ctx;
}, 'Analyze', 'Performs a remote analysis', 1);

ProcessingGraph.createRoutine([analyze], 'AnalyzeRoutine', 'Basic analysis flow');

const server = ProcessingGraph.createServer('AnalysisService', 'Runs analysis routines');
server.setPort(3000);
server.start();
```

---

## Service A: Main Service (Default Port)

```ts
import ProcessingGraph from 'processing-graph';

const prepare = ProcessingGraph.createTask((ctx) => {
  ctx.input = `Document #${ctx.id}`;
  return ctx;
}, 'Prepare', 'Prepares input', 1);

// Create deputy to remote routine
const deputy = ProcessingGraph.createDeputyTask('AnalyzeRoutine', 'AnalysisService', 1);

// Continue locally after the remote task returns
const report = ProcessingGraph.createTask((ctx) => {
  console.log('[REPORT]', ctx.analysis);
  return true;
}, 'Report', 'Logs remote analysis result', 1);

// Connect graph
deputy.doAfter(prepare);
report.doAfter(deputy);

// Create routine
ProcessingGraph.createRoutine([prepare], 'MainRoutine', 'Delegates to remote service');

const server = ProcessingGraph.createServer('MainService', 'Triggers distributed flows');
server.start();
```

---

## Step 3: Trigger the Routine with an Agent

Create a separate script or module to act as a trigger:

```ts
import ProcessingGraph from 'processing-graph';

const agent = ProcessingGraph.createAgent();
const result = await agent.createContract('MainRoutine', { id: 42 });

console.log('Execution result:', result);
```

---

## Running the Demo

1. **Terminal 1: Start Analysis Service**
```bash
node analysis-service.js
```

2. **Terminal 2: Start Main Service**
```bash
node main-service.js
```

3. **Terminal 3: Trigger via Agent**
```bash
node agent-trigger.js
```

---

## How It Works

- Service A runs `Prepare`
- Sends context to Service B using `DeputyTask`
- Service B runs `AnalyzeRoutine`, returns result
- Service A continues with `Report`
- `Agent` triggers and receives the final result

---

## Recap

You now understand:
- How to run two services on separate ports
- How to delegate part of a workflow to a remote service
- How to trigger a routine execution with an `Agent`
- That service discovery, routing, and context passing is all automatic

---

## What’s Next?

In Chapter 4, we’ll explore error handling, failure reporting, and recovery flows.

---