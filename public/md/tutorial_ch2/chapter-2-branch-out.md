# Chapter 2 – Branch Out

**Goal**: Learn how to build a true graph structure with parallel branches, joins, async tasks, and forked executions using yielded contexts.

---

## 1. Add More Tasks

We'll start by defining three simple tasks:

```ts
const fetchUser = ProcessingGraph.createTask(async (context) => {
  context.user = { id: 1, name: 'Alice' };
  return context;
}, 'FetchUser', 'Simulates fetching user data', 1);

const enrichUser = ProcessingGraph.createTask((context) => {
  context.user.enriched = true;
  return context;
}, 'EnrichUser', 'Adds enrichment to user object', 1);

const logUser = ProcessingGraph.createTask((context) => {
  console.log('User:', context.user);
  return true;
}, 'LogUser', 'Logs user info', 1);
```

---

## 2. Branching and Parallelism

We can run `enrichUser` and `logUser` **in parallel** after `fetchUser`:

```ts
enrichUser.doAfter(fetchUser);
logUser.doAfter(fetchUser);
```

This creates two branches that run concurrently after the same parent.

---

## 3. Join Tasks with `createUniqueTask`

We can re-merge branches using a **unique task**, which will wait for all parent branches:

```ts
const summarize = ProcessingGraph.createUniqueTask((contexts) => {
  return {
    summary: contexts.map(c => c.user),
  };
}, 'Summarize', 'Merges data from multiple branches', 1);

summarize.doAfter(enrichUser);
summarize.doAfter(logUser);
```

---

## 4. Fork with `yield` to Create Parallel Subflows

Let’s say we want to create a review task **for each item** in a list:

```ts
const forkReviews = ProcessingGraph.createTask((context) => {
  return function* () {
    for (const item of context.items || []) {
      yield { ...context, reviewItem: item };
    }
  };
}, 'ForkReviews', 'Forks graph into per-item review tasks', 1);
```

Then each branch gets processed by:

```ts
const review = ProcessingGraph.createTask((ctx) => {
  console.log('Reviewing:', ctx.reviewItem);
  return ctx;
}, 'Review', 'Processes one item', 3);

review.doAfter(forkReviews);
```

---

## 5. Async Behavior

Tasks defined with `async` are automatically awaited before their children run. No special handling needed.

---

## 6. Routine Definition and Execution

Let’s register the full routine:

```ts
ProcessingGraph.createRoutine([fetchUser, forkReviews], 'BranchingDemo', 'Demonstrates branching and joining');
```

And run it:

```ts
const runner = ProcessingGraph.createRunner();
runner.run(fetchUser, {
  items: ['apple', 'banana', 'cherry']
});
```

---

## Recap

In this chapter, you learned how to:
- Execute tasks in **parallel**
- Merge results with **join tasks**
- Create dynamic **subflows using yield**
- Use **async tasks** without extra config

---

## Up Next: Chapter 3 – Distributed Without Tears

We’ll connect multiple services and delegate work between them using `DeputyTask`.