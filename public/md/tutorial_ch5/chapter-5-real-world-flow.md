# Chapter 5 – Real-World Flow

**Goal**: Combine everything you’ve learned into a practical, distributed, fault-tolerant flow. In this example, we'll process a document through multiple stages including async validation, remote analysis, per-page review, and robust finalization.

---

## Overview

We'll build:
1. A local main service with document preparation and review logic
2. A remote analysis service that performs OCR and metadata extraction
3. Forked page-level review
4. A graceful error handler

---

## Step 1: Remote Analysis Service

```ts
import ProcessingGraph from 'processing-graph';

const ocr = ProcessingGraph.createTask((ctx) => {
  ctx.steps = [...(ctx.steps || []), 'OCR'];
  return ctx;
}, 'OCR', 'Performs OCR on document', 2);

const meta = ProcessingGraph.createTask((ctx) => {
  ctx.steps = [...(ctx.steps || []), 'Metadata'];
  return ctx;
}, 'Metadata', 'Extracts metadata', 2);

const join = ProcessingGraph.createUniqueTask((contexts) => {
  return {
    steps: contexts.flatMap(c => c.steps || [])
  };
}, 'JoinRemote', 'Joins OCR + Metadata', 1);

join.doAfter(ocr);
join.doAfter(meta);

ProcessingGraph.createRoutine([ocr, meta], 'AnalyzeDoc', 'Remote analysis');

const server = ProcessingGraph.createServer('WorkerService', 'Handles OCR and metadata');
server.setPort(3000);
server.start();
```

---

## Step 2: Main Service

```ts
import ProcessingGraph from 'processing-graph';

// Async validation
const validate = ProcessingGraph.createTask(async (ctx) => {
  if (!ctx.document) throw new Error('Missing document');
  return ctx;
}, 'Validate', 'Checks input', 1);

// Deputy to remote analysis
const deputy = ProcessingGraph.createDeputyTask('AnalyzeDoc', 'WorkerService', 1);

// Fork page reviews
const forkPages = ProcessingGraph.createTask((ctx) => {
  const pages = ctx.pages || [];
  return function* () {
    for (const page of pages) {
      yield { ...ctx, page };
    }
  };
}, 'ForkPages', 'Splits into pages', 1);

const review = ProcessingGraph.createTask((ctx) => {
  ctx.reviewed = true;
  return ctx;
}, 'ReviewPage', 'Reviews a single page', 5);

// Join pages
const joinPages = ProcessingGraph.createUniqueTask((contexts) => ({
  reviewedPages: contexts.map(c => c.page)
}), 'JoinPages', 'Joins page results', 1);

// Finalize
const finalize = ProcessingGraph.createTask((ctx) => {
  console.log('Finalized doc:', ctx);
  return ctx;
}, 'Finalize', 'Wraps it up', 1);

// Error handler
const fallback = ProcessingGraph.createTask((ctx) => {
  console.error('Error:', ctx.error);
  return ctx;
}, 'ErrorHandler', 'Logs error', 1);

// Graph wiring
deputy.doAfter(validate);
forkPages.doAfter(deputy);
review.doAfter(forkPages);
joinPages.doAfter(review);
finalize.doAfter(joinPages);

validate.doOnFail(fallback);
deputy.doOnFail(fallback);

ProcessingGraph.createRoutine([validate], 'DocReview', 'Full document processing');

const server = ProcessingGraph.createServer('MainService', 'Handles full flow');
server.start();
```

---

## Step 3: Trigger with Agent

```ts
import ProcessingGraph from 'processing-graph';

const agent = ProcessingGraph.createAgent();
const result = await agent.createContract('DocReview', {
  document: 'doc-123',
  pages: [1, 2, 3]
});
console.log('Review result:', result);
```

---

## Recap

This flow includes:
- Async task execution
- Conditional validation
- DeputyTasks to remote services
- Page-level fan-out using `yield`
- Merging of branches via `createUniqueTask`
- Error fallback using `.doOnFail`

---

## What’s Next?

In Chapter 6, we’ll explore how to use the UI dashboard to monitor this execution, inspect results, and retry or debug failed flows.

---