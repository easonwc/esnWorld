"use client";

import { useMemo, useState } from "react";
import { apiOperations, type ApiOperation, type HttpMethod } from "@/lib/openapi-spec";
import styles from "./api-docs.module.css";

interface ApiResponse {
  status: number;
  body: string;
  ok: boolean;
}

function methodClass(method: HttpMethod): string {
  return method === "GET" ? styles.methodGet : styles.methodPost;
}

function groupByTag(operations: ApiOperation[]): Map<string, ApiOperation[]> {
  const groups = new Map<string, ApiOperation[]>();

  for (const op of operations) {
    const existing = groups.get(op.tag) ?? [];
    existing.push(op);
    groups.set(op.tag, existing);
  }

  return groups;
}

async function executeOperation(
  op: ApiOperation,
  requestBody: string,
): Promise<ApiResponse> {
  const init: RequestInit = {
    method: op.method,
    cache: "no-store",
  };

  const url =
    op.method === "GET" ? `${op.path}?_t=${Date.now()}` : op.path;

  if (op.method !== "GET" && op.requestBody !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = requestBody;
  }

  const response = await fetch(url, init);
  const text = await response.text();

  let formatted = text;
  try {
    formatted = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // keep raw text
  }

  return {
    status: response.status,
    body: formatted,
    ok: response.ok,
  };
}

export default function ApiDocsPage() {
  const grouped = useMemo(() => groupByTag(apiOperations), []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tryItOut, setTryItOut] = useState<Record<string, boolean>>({});
  const [bodies, setBodies] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      apiOperations
        .filter((op) => op.requestBody)
        .map((op) => [op.id, op.requestBody as string]),
    ),
  );
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleTryItOut(id: string) {
    setTryItOut((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleExecute(op: ApiOperation) {
    setLoading((prev) => ({ ...prev, [op.id]: true }));
    setErrors((prev) => ({ ...prev, [op.id]: "" }));

    try {
      const result = await executeOperation(op, bodies[op.id] ?? "");
      setResponses((prev) => ({ ...prev, [op.id]: result }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [op.id]: error instanceof Error ? error.message : "Request failed",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [op.id]: false }));
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ESN World Engine API</h1>
        <p className={styles.subtitle}>Version 0.1.0 — interactive API explorer</p>
        <a className={styles.specLink} href="/api/openapi" target="_blank" rel="noreferrer">
          OpenAPI JSON spec →
        </a>
      </header>

      {[...grouped.entries()].map(([tag, operations]) => (
        <section key={tag}>
          <h2 className={styles.tag}>{tag}</h2>

          {operations.map((op) => {
            const isExpanded = expanded[op.id] ?? false;
            const isTryItOut = tryItOut[op.id] ?? false;
            const response = responses[op.id];
            const error = errors[op.id];

            return (
              <article key={op.id} className={styles.operation}>
                <button
                  type="button"
                  className={styles.operationHeader}
                  onClick={() => toggleExpanded(op.id)}
                  aria-expanded={isExpanded}
                >
                  <span className={`${styles.method} ${methodClass(op.method)}`}>
                    {op.method}
                  </span>
                  <span className={styles.path}>{op.path}</span>
                  <span className={styles.summary}>{op.summary}</span>
                </button>

                {isExpanded && (
                  <div className={styles.operationBody}>
                    <p className={styles.description}>{op.description}</p>

                    <button
                      type="button"
                      className={`${styles.tryItOut} ${isTryItOut ? styles.tryItOutActive : ""}`}
                      onClick={() => toggleTryItOut(op.id)}
                    >
                      {isTryItOut ? "Cancel" : "Try it out"}
                    </button>

                    {isTryItOut && (
                      <div className={styles.panel}>
                        {op.requestBody !== undefined && (
                          <>
                            <p className={styles.panelTitle}>Request body</p>
                            <textarea
                              className={styles.textarea}
                              value={bodies[op.id] ?? ""}
                              onChange={(event) =>
                                setBodies((prev) => ({
                                  ...prev,
                                  [op.id]: event.target.value,
                                }))
                              }
                            />
                          </>
                        )}

                        <button
                          type="button"
                          className={styles.execute}
                          disabled={loading[op.id]}
                          onClick={() => handleExecute(op)}
                        >
                          {loading[op.id] ? "Executing…" : "Execute"}
                        </button>

                        {error && <p className={styles.errorText}>{error}</p>}

                        {response && (
                          <div className={styles.panel}>
                            <p className={styles.panelTitle}>Response</p>
                            <p className={styles.responseMeta}>
                              Status:{" "}
                              <span
                                className={
                                  response.ok ? styles.statusOk : styles.statusError
                                }
                              >
                                {response.status}
                              </span>
                            </p>
                            <pre className={styles.pre}>{response.body}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </main>
  );
}
