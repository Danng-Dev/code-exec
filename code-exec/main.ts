// @ts-types="npm:@types/express@4.17.15 "

import express from "express";
import process from "node:process";
import { Sandbox } from "@deno/sandbox";

export const app = express();
app.use(express.json()); // parse JSON bodies

// simple API key middleware
export function checkApiKey(req: express.Request, res: express.Response) {
  const apiKey = req.headers["apikey"] || req.headers["api-key"];
  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

app.get("/", (req, res) => {
  if (!checkApiKey(req, res)) return;
  res.status(200).json({ message: "Authorized!" });
});

// helper used by tests
export async function evaluateSnippet(code: string) {
  await using sandbox = await Sandbox.create();
  return sandbox.deno.eval(code);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Remote code execution endpoint - Deno eval
app.post("/run", async (req, res) => {
  if (!checkApiKey(req, res)) return;

  const { code } = req.body;
  if (typeof code !== "string") {
    res.status(400).json({ error: "Request JSON must include a `code` string" });
    return;
  }

  try {
    const result = await evaluateSnippet(code);
    res.status(200).json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Shell command execution endpoint
app.post("/exec", async (req, res) => {
  if (!checkApiKey(req, res)) return;

  const { command } = req.body;
  if (typeof command !== "string") {
    res.status(400).json({ error: "Request JSON must include a `command` string" });
    return;
  }

  try {
    await using sandbox = await Sandbox.create();
    const output = await sandbox.sh`${command}`.text();
    res.status(200).json({ output });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

