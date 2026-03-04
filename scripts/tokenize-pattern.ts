import fs from 'fs-extra';
import path from 'path';

interface TokenMapping {
  category: string;
  tokenMap: Record<string, string[]>;
}

interface TokenReplacement {
  token: string;
  tag: string;
  index: number;
  original: string;
}

interface Manifest {
  input: string;
  output: string;
  category: string;
  tokensUsed: string[];
  replacements: TokenReplacement[];
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '');
      const value = argv[i + 1];
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

function protectComments(content: string): { content: string; comments: string[] } {
  const comments: string[] = [];
  const protectedContent = content.replace(/<!--[\s\S]*?-->/g, (match) => {
    const index = comments.length;
    comments.push(match);
    return `__COMMENT_${index}__`;
  });
  return { content: protectedContent, comments };
}

function restoreComments(content: string, comments: string[]): string {
  return content.replace(/__COMMENT_(\d+)__/g, (match, idx) => comments[Number(idx)] ?? match);
}

function replaceTagContent(
  content: string,
  tag: string,
  tokens: string[],
  replacements: TokenReplacement[]
): { content: string; used: string[] } {
  if (!tokens || tokens.length === 0) return { content, used: [] };
  let index = 0;
  const used: string[] = [];
  const regex = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');

  const updated = content.replace(regex, (match, attrs, inner) => {
    if (index >= tokens.length) return match;
    if (!inner || inner.trim().length === 0) return match;
    if (inner.includes('<')) return match; // avoid nested markup modifications

    const token = tokens[index];
    index += 1;
    used.push(token);
    replacements.push({ token, tag, index, original: inner.trim() });
    return `<${tag}${attrs}>{{${token}}}</${tag}>`;
  });

  return { content: updated, used };
}

function replaceAltAttributes(
  content: string,
  tokens: string[],
  replacements: TokenReplacement[]
): { content: string; used: string[] } {
  if (!tokens || tokens.length === 0) return { content, used: [] };
  let index = 0;
  const used: string[] = [];
  const updated = content.replace(/alt="([^"]*)"/gi, (match, value) => {
    if (index >= tokens.length) return match;
    const token = tokens[index];
    index += 1;
    used.push(token);
    replacements.push({ token, tag: 'alt', index, original: value.trim() });
    return `alt="{{${token}}}"`;
  });
  return { content: updated, used };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input;
  const mappingPath = args.mapping;
  const outputPath = args.output;
  const manifestPath = args.manifest;

  if (!inputPath || !mappingPath || !outputPath) {
    console.error('Usage: tsx scripts/tokenize-pattern.ts --input <file> --mapping <mapping.json> --output <file> [--manifest <file>]');
    process.exit(1);
  }

  const mapping = (await fs.readJson(mappingPath)) as TokenMapping;
  const source = await fs.readFile(inputPath, 'utf8');
  const { content: protectedContent, comments } = protectComments(source);

  const replacements: TokenReplacement[] = [];
  const tokensUsed: string[] = [];

  let working = protectedContent;

  const tagOrder = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'li'];
  for (const tag of tagOrder) {
    const tokens = mapping.tokenMap?.[tag] || [];
    const result = replaceTagContent(working, tag, tokens, replacements);
    working = result.content;
    tokensUsed.push(...result.used);
  }

  const altTokens = mapping.tokenMap?.alt || [];
  const altResult = replaceAltAttributes(working, altTokens, replacements);
  working = altResult.content;
  tokensUsed.push(...altResult.used);

  const restored = restoreComments(working, comments);

  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, restored, 'utf8');

  const manifest: Manifest = {
    input: inputPath,
    output: outputPath,
    category: mapping.category,
    tokensUsed: Array.from(new Set(tokensUsed)),
    replacements,
  };

  const resolvedManifestPath = manifestPath || `${outputPath}.manifest.json`;
  await fs.ensureDir(path.dirname(resolvedManifestPath));
  await fs.writeJson(resolvedManifestPath, manifest, { spaces: 2 });

  console.log(`Tokenized pattern written to ${outputPath}`);
  console.log(`Manifest written to ${resolvedManifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
