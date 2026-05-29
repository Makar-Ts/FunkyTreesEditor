export function stripComments(input) {
  let output = "";

  let i = 0;
  let inString = false;
  let quote = null;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    // strings preserved fully
    if (inString) {
      output += ch;

      if (ch === "\\" && i + 1 < input.length) {
        output += input[i + 1];
        i += 2;
        continue;
      }

      if (ch === quote) {
        inString = false;
        quote = null;
      }

      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      quote = ch;
      output += ch;
      i++;
      continue;
    }

    // line comment
    if (ch === "/" && next === "/") {
      i += 2;
      while (i < input.length && input[i] !== "\n") i++;
      continue; // newline is preserved naturally
    }

    // block comment
    if (ch === "/" && next === "*") {
      i += 2;

      while (i < input.length) {
        if (input[i] === "*" && input[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }

      continue;
    }

    output += ch;
    i++;
  }

  return output;
}