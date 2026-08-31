#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { Workbook } from "exceljs";
import type { IngestOptions, IngestReport } from "./types";
import { parseWorkbook, type ParsedRows } from "./parser";
import { readInDir } from "./csv-source";
import { transform } from "./transformer";

function printHelp(): void {
  console.log(`
Usage: npx tsx tools/ingest-xlsx/src/index.ts [options]

Options:
  --in, -i       Path to input XLSX file (mutually exclusive with --in-dir)
  --in-dir       Path to a directory with rings.csv/sectors.csv/items.csv +
                 narrative/*.md (mutually exclusive with --in)
  --out, -o      Path to output JSON file (required)
  --id           Override the generated schema's id
  --title        Override the generated schema's title
  --verbose, -v  Enable verbose logging
  --help, -h     Show this help message

Examples:
  npx tsx tools/ingest-xlsx/src/index.ts --in data.xlsx --out public/data/output.json
  npx tsx tools/ingest-xlsx/src/index.ts --in-dir data/electronica --out public/data/ceet-electronica.json --id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"
`);
}

function parseArgs(args: string[]): IngestOptions {
  const options: Partial<IngestOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--in":
      case "-i":
        options.input = args[++i];
        break;
      case "--in-dir":
        options.inDir = args[++i];
        break;
      case "--out":
      case "-o":
        options.output = args[++i];
        break;
      case "--id":
        options.id = args[++i];
        break;
      case "--title":
        options.title = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
    }
  }

  if (!options.input && !options.inDir) {
    console.error("Error: one of --in or --in-dir is required.");
    printHelp();
    process.exit(1);
  }
  if (options.input && options.inDir) {
    console.error("Error: --in and --in-dir are mutually exclusive.");
    printHelp();
    process.exit(1);
  }
  if (!options.output) {
    console.error("Error: --out is required.");
    printHelp();
    process.exit(1);
  }

  return options as IngestOptions;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  let parsed: ParsedRows;

  if (options.inDir) {
    if (!fs.existsSync(options.inDir)) {
      console.error(`Error: --in-dir directory not found: ${options.inDir}`);
      process.exit(1);
    }
    if (options.verbose) {
      console.log(`Reading ${options.inDir}...`);
    }
    parsed = readInDir(options.inDir, options.verbose);
  } else {
    const input = options.input as string;
    if (!fs.existsSync(input)) {
      console.error(`Error: Input file not found: ${input}`);
      process.exit(1);
    }
    if (options.verbose) {
      console.log(`Reading ${input}...`);
    }
    const workbook = new Workbook();
    await workbook.xlsx.readFile(input);
    parsed = await parseWorkbook(workbook, options.verbose);
  }

  const { schema, errors, warnings } = transform(parsed, { id: options.id, title: options.title });

  const report: IngestReport = {
    success: errors.length === 0,
    itemsProcessed: schema.items.length,
    ringsProcessed: schema.rings.length,
    sectorsProcessed: schema.sectors.length,
    errors,
    warnings,
  };

  // Ensure output directory exists
  const outDir = path.dirname(options.output);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (errors.length === 0) {
    fs.writeFileSync(options.output, JSON.stringify(schema, null, 2), "utf-8");
    console.log(`\n✓ Written ${options.output}`);
  }

  console.log(`  Rings:    ${report.ringsProcessed}`);
  console.log(`  Sectors:  ${report.sectorsProcessed}`);
  console.log(`  Items:    ${report.itemsProcessed}`);

  if (warnings.length > 0) {
    console.log(`\n⚠ Warnings (${warnings.length}):`);
    warnings.forEach((w) => {
      console.log(`  [${w.sheet} @ row ${w.row}] ${w.message}`);
    });
  }

  if (errors.length > 0) {
    console.log(`\n✗ Errors (${errors.length}):`);
    errors.forEach((e) => {
      console.log(`  [${e.sheet} @ row ${e.row}] ${e.message}`);
    });
    process.exit(1);
  }

  console.log("\n✓ Ingestion completed successfully.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
