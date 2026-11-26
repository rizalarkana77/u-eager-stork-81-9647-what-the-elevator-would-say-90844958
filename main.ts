import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 120;

function elevatorLine(): string {
  return "One of you just did that. I have no windows, no nose, and nine floors left to remember it by.";
}

function validateLine(line: string): void {
  if (line.length === 0) {
    throw new Error("entry line must not be empty");
  }
  if (line.length > MAX_CHARS) {
    throw new Error(`entry line exceeds ${MAX_CHARS} characters: ${line.length}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry line must be a single line with no newline characters");
  }
  if (line !== line.trim()) {
    throw new Error("entry line must not carry leading or trailing whitespace");
  }
  if (Buffer.byteLength(line, "utf8") !== line.length) {
    throw new Error("entry line must be plain ASCII so char count equals byte count");
  }
}

function main(): void {
  const line = elevatorLine();
  validateLine(line);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, line, "utf8");

  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== line) {
    throw new Error("read-back verification failed: written bytes differ from entry line");
  }

  const sha256 = createHash("sha256").update(readBack, "utf8").digest("hex");
  console.log(`entry.txt written to ${outPath}`);
  console.log(`chars: ${readBack.length}`);
  console.log(`sha256: ${sha256}`);
}

main();
