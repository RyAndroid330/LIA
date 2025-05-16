# Chapter 4 – Break Stuff Gracefully

**Goal**: Learn how the framework handles errors by default, how to define error flows using `.doOnFail()`, and how to prepare for more advanced fault tolerance patterns.

---

## 1. Default Error Behavior

If a task throws an error or fails unexpectedly and no error handler is defined, the following happens:
- The task execution stops
- The graph execution halts at that point
- The context is returned (with the error info attached)

You do **not** need to write try/catch logic in your tasks.

---

## 2. Graceful Error Handling with `.doOnFail()`

Let’s define a task that might fail:

```ts
const risky = ProcessingGraph.createTask((ctx) => {
  if (!ctx.ok) throw new Error("Something went wrong!");
  ctx.success = true;
  return ctx;
}, 'Risky', 'Might throw an error', 1);
```

Define an error handler:

```ts
const fallback = ProcessingGraph.createTask((ctx) => {
  console.warn('[RECOVERY]', ctx.error || 'Unknown error');
  ctx.recovered = true;
  return ctx;
}, 'Fallback', 'Logs the error and recovers', 1);
```

Attach it to the risky task:

```ts
risky.doOnFail(fallback);
```

---

## 3. Marking Failures Manually

You don’t have to throw errors. You can also return a context with `.failed = true` or `.errored = true`.

```ts
const conditional = ProcessingGraph.createTask((ctx) => {
  if (!ctx.ready) {
    ctx.failed = true;
    return ctx;
  }
  return ctx;
}, 'ConditionCheck', 'Fails softly if not ready', 1);
```

The `.doOnFail()` path will trigger just like if the task had thrown.

---

## 4. Advanced Error Graphs (Optional)

You can also link an entire graph under a `.doOnFail()` node:

```ts
const alert = ProcessingGraph.createTask(...);
const cleanup = ProcessingGraph.createTask(...);

alert.doAfter(fallback);
cleanup.doAfter(alert);

risky.doOnFail(fallback);
```

This creates a full **error subgraph** triggered only if `risky` fails.

---

## 5. What Not To Do

`.doOnFail()` should **not** be used for conditional branching or core flow logic. It is designed for:
- Logging
- Cleanup
- Alerting
- Optional retries (if done carefully)

---

## 6. Looking Ahead: Retries and Recovery

- Task-level retries are coming soon (`retries`, `delay`, `backoff`)
- Automatic resume from last task after a crash is in development
- Manual restart via the dashboard is supported

---

## Recap

You’ve learned:
- What happens when a task fails
- How to add error recovery with `.doOnFail()`
- That you can manually fail a task via `ctx.failed`
- How to attach fallback graphs
- That recovery and retries are core parts of the framework’s roadmap

---

## Next: Chapter 5 – Real-World Flow

Let’s combine what you’ve learned into a practical, multi-branch, distributed graph — with remote routines, page-level forks, and error-aware joins.

---