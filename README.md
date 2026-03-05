# code-exec

This repository contains a simple Express server running under **Deno**. It exposes
an endpoint to execute arbitrary JavaScript/TypeScript inside a **Deno Deploy
sandbox**. The API is protected by a single API key.

## Features

- `GET /health` health check (no API key required)
- `GET /` authorization check (requires API key)
- `POST /run` execute code in a remote Deno Deploy sandbox (requires API key)
- `POST /exec` execute shell commands in a remote sandbox (requires API key)
- Sandbox creation is handled via the official `@deno/sandbox` SDK

## Getting Started

### Prerequisites

- [Deno](https://deno.com) 1.40+ installed (this container already has it).
- A Deno Deploy organization token set to `DENO_DEPLOY_TOKEN`.
- An API key value set in `API_KEY` (used to protect the endpoints).

### Install dependencies

Dependencies are managed by Deno imports. Run:

```bash
cd code-exec
deno task dev
```

The `dev` task is defined in `deno.json` and starts the server with
`--allow-net --watch`.

### Environment

Create a `.env` file or export variables in your shell:

```
export API_KEY="your-secret-key"
export DENO_DEPLOY_TOKEN="..."
```

### Running locally

With the variables defined, start the server:

```bash
cd code-exec
deno task dev
```

or manually:

```bash
deno run --allow-net --allow-env main.ts
```

Then hit `http://localhost:8000/health` to verify the server is running.

### Using the API

Health check (no auth required):
```bash
curl http://localhost:8000/health
```

Execute JavaScript/TypeScript code in sandbox:
```bash
curl -X POST http://localhost:8000/run \
  -H "apiKey: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"code":"2+2"}'
```

Execute shell commands in sandbox:
```bash
curl -X POST http://localhost:8000/exec \
  -H "apiKey: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"command":"ls -lh /"}'
```

The response will contain the result returned by the sandbox.

### Testing

```bash
cd code-exec
deno task test
```

or manually:

```bash
deno test --allow-env main_test.ts
```

Note that sandbox-related tests are skipped when `DENO_DEPLOY_TOKEN` is not set.

## Deno Deploy

When deploying to Deno Deploy you only need to configure the `DENO_DEPLOY_TOKEN`
and `API_KEY` as environment variables. The server code is compatible with
Deno Deploy's runtime and will automatically create sandboxes for each request.

> ⚠️ **Security warning:** allowing remote code execution is extremely dangerous.
> Only use this pattern in controlled, audited environments.
