# Chapter 1 – Hello Graph!

**Goal**: Get your first processing graph running in under 5 minutes, understand tasks and context flow, and see the graph in action.

---

## Step 1: Install the Framework

Install via npm:

```bash
npm install processing-graph
```

This gives you access to the API used to define, run, and distribute workflows.

---

## Step 2: Create Your First Task

A task is defined by a function that receives a context object and optionally returns an updated context.

```ts
import ProcessingGraph from 'processing-graph';

const greet = ProcessingGraph.createTask((context) => {
  context.message = `Hello, ${context.name || 'world'}!`;
  return context;
}, 'Greet', 'Creates a greeting', 1);
```

---

## Step 3: Run the Task Locally

Use the built-in runner to execute the task locally with a sample context:

```ts
const runner = ProcessingGraph.createRunner();

runner.run(greet, { name: 'Alice' });
```

The context is passed to the task and updated along the way.

---

## Step 4: Create a Simple Flow

Now let’s add a second task and create a minimal graph:

```ts
const print = ProcessingGraph.createTask((context) => {
  console.log(context.message);
  return true;
}, 'Print', 'Logs the message', 1);

// Define execution order:
print.doAfter(greet);

// Create a routine:
ProcessingGraph.createRoutine([greet], 'SimpleGreeting', 'Says hello and prints it');
```

---

## Step 5: Visualize It

Once run, the framework will automatically record execution data to the local database. If you're using the UI dashboard:

- You’ll see the graph
- Each task will be highlighted as it runs
- You can inspect the context after each step

---

## Recap

You’ve just:
- Defined tasks
- Linked them with `.doAfter(...)`
- Executed a graph locally
- Seen how the context moves through the flow

---

## What’s Next?

In Chapter 2, we’ll add:
- **Branches**
- **Async functions**
- **Forked contexts**
- **Join tasks**

and build a much richer, parallel graph.

---