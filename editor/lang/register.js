import * as monaco from "../../libs/monaco-editor/main.js";
import { variables, keywords, functions } from "./names.js";
import { funkyDocs } from './docs.js'

monaco.languages.register({ id: "funky" });

monaco.languages.setMonarchTokensProvider("funky", {
  keywords,
  variables,
  functions,

  tokenizer: {
    root: [
      // strings
      [/".*?"/, "string"],

      // numbers
      [/\d+(\.\d+)?/, "number"],

      // fields
      [
        /^ *\w+ *\|=/,
        "field"
      ],

      // functions
      [
        /[a-zA-Z_]\w*(?=\s*\()/,
        {
          cases: {
            "@functions": "function",
            "@default": "identifier",
          },
        },
      ],

      // variables
      [
        /[A-Z][A-Za-z0-9_]*/,
        {
          cases: {
            "@variables": "variable",
            "@default": "type",
          },
        },
      ],

      // booleans
      [/\b(true|false)\b/, "keyword"],

      // operators
      [/[+\-*\/]/, "operator"],
      [/[=!><]=?/, "operator"],
      [/[&|!]/, "operator"],

      // parentheses
      [/[()]/, "@brackets"],

      // commas
      [/,/, "delimiter"],
    ],
  },
});

monaco.editor.defineTheme("funky-dark", {
  base: "vs-dark",
  inherit: true,

  rules: [
    { token: "field", foreground: "FFE000" },
    { token: "variable", foreground: "4FC1FF" },
    { token: "function", foreground: "DCDCAA" },
    { token: "keyword", foreground: "C586C0" },

    { token: "number", foreground: "B5CEA8" },
    { token: "string", foreground: "CE9178" },

    { token: "operator", foreground: "D4D4D4" },
  ],

  colors: {
    "editor.background": "#1E1E1E",
  },
});

monaco.languages.registerCompletionItemProvider("funky", {
  triggerCharacters: ["("],

  provideCompletionItems(model, position) {
    const suggestions = [];

    // Field Create
    /** @type {string} */
    const line = model.getLineContent(position.lineNumber).slice(0, position.column).trim();

    if (line.match(/^[^ ]+$/)) {
      suggestions.push({
        label: `${line}`,

        kind:  monaco.languages.CompletionItemKind.Field,
        detail: 'create field',

        insertText: `${line} |= `,
      })
    }

    // Fields
    const fields = model.findMatches(
      /^ *\w+ *\|=/,
      false,
      true,
      false,
      null,
      false 
    );

    for (const { range } of fields) {
      const match = model.getValueInRange(range)
        .replace('|=', '')
        .trim();

      suggestions.push({
        label: `${match}`,

        kind:  monaco.languages.CompletionItemKind.Variable,
        detail: 'field',

        insertText: `${match}`,
      })
    }

    // FUNCTIONS
    for (const [name, meta] of Object.entries(funkyDocs.functions)) {
      suggestions.push({
        label: name,

        kind: monaco.languages.CompletionItemKind.Function,

        detail: meta.signature,

        documentation: {
          value: `
${meta.description}

### Parameters
${meta.params.map((x) => `- ${x}`).join("\n")}

### Example
\`\`\`
${meta.example}
\`\`\`
`,
        },

        insertText: `${name}($0)`,

        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
    }

    // VARIABLES
    for (const [name, meta] of Object.entries(funkyDocs.variables)) {
      suggestions.push({
        label: name,

        kind: monaco.languages.CompletionItemKind.Variable,

        detail: meta.type,

        documentation: {
          value: `
${meta.description}

Type: ${meta.type}

${meta.range ? `Range: ${meta.range}` : ""}
`,
        },

        insertText: name,
      });
    }

    return { suggestions };
  },
});

monaco.languages.registerSignatureHelpProvider("funky", {
  signatureHelpTriggerCharacters: ["(", ","],

  provideSignatureHelp(model, position) {
    const text = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,

      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const match = text.match(/([a-zA-Z_]\w*)\([^()]*$/);

    if (!match) return null;

    const fnName = match[1];

    const meta = funkyDocs.functions[fnName];

    if (!meta) return null;

    const commas = (text.match(/,/g) || []).length;

    return {
      value: {
        signatures: [
          {
            label: meta.signature,

            documentation: meta.description,

            parameters: meta.params.map((p) => ({
              label: p,
            })),
          },
        ],

        activeSignature: 0,

        activeParameter: Math.min(commas, meta.params.length - 1),
      },

      dispose() {},
    };
  },
});


function findOperator(symbol) {
  const categories = ['math', 'comparison', 'boolean', 'ternary'];
  for (const category of categories) {
    const op = funkyDocs.operators[category]?.find(op => op.symbol === symbol);
    if (op) return { ...op, category };
  }
  return null;
}

monaco.languages.registerHoverProvider("funky", {
  provideHover(model, position) {
    const word = model.getWordAtPosition(position);

    if (!word) {
      const char = model.getLineContent(position.lineNumber)[position.column-1];
      const char2b = model.getLineContent(position.lineNumber).slice(position.column-2, position.column);
      const char2 = model.getLineContent(position.lineNumber).slice(position.column-1, position.column+1);
      console.log(char);

      const operator = findOperator(char2b) ?? findOperator(char2) ?? findOperator(char);
      if (operator) {
        const content = [
          { value: `## Operator: ${operator.symbol}` },
          { value: operator.description },
          { value: `**Category:** ${operator.category}` },
        ];
        if (operator.example) {
          content.push({ value: `**Example:** \`${operator.example}\`` });
        }
        if (operator.explanation) {
          content.push({ value: operator.explanation });
        }
        return { contents: content };
      }

      return null;
    }

    const fn = funkyDocs.functions[word.word];
    if (fn) {
      return {
        contents: [
          { value: `## ${fn.signature}` },
          { value: fn.description },
          {
            value: `
### Parameters
${fn.params.map((x) => `- ${x}`).join("\n")}
`,
          },
          {
            value: `
### Example
\`\`\`
${fn.example}
\`\`\`
`,
          },
        ],
      };
    }

    const variable = funkyDocs.variables[word.word];
    if (variable) {
      return {
        contents: [
          { value: `## ${word.word}` },
          { value: variable.description },
          { value: `Type: ${variable.type}` },
          { value: variable.range ? `Range: ${variable.range}` : "" },
        ],
      };
    }

    return null;
  },
});

monaco.languages.setLanguageConfiguration("funky", {
  brackets: [["(", ")"]],
  colorizedBracketPairs: [["(", ")"], ["?", ":"]],

  autoClosingPairs: [
    {
      open: "(",
      close: ")",
    },
    {
      open: '"',
      close: '"',
    },
    {
      open: "?",
      close: ":"
    }
  ],
});
