import { funkyDocs } from '../../../editor/lang/docs.js';
import * as monaco from '../../../libs/monaco-editor/main.js';

export const BREADCRUMBS_COLORS = {
  FIELD: "#FFE000",
  ARGUMENT: "#9CDCFE",
  FUNCTION: "#DCDCAA",
  VARIABLE: "#4FC1FF",
  STRING: "#CE9178",
  NUMBER: "#B5CEA8",
  BOOLEAN: "#569CD6",
  OPERATOR: "#D4D4D4",
  CONDITIONAL: "#C586C0",
  EXPRESSION: "#808080",
};

export const BREADCRUMBS_ICONS = {
  FIELD: "symbol-field",
  ARGUMENT: "symbol-parameter",
  FUNCTION: "symbol-function",
  VARIABLE: "symbol-variable",
  STRING: "symbol-string",
  NUMBER: "symbol-number",
  BOOLEAN: "symbol-boolean",
  OPERATOR: "symbol-operator",

  EXPRESSION_TEST: "symbol-boolean",
  EXPRESSION_CONS: "check",
  EXPRESSION_ALT: "close",
  EXPRESSION: "question",
};

export class Breadcrumb {
  constructor(content, color, startPosition, icon = null) {
    this.content = content;
    this.color = color;
    this.startPosition = startPosition;
    this.icon = icon;
  }
}

function pushBreadcrumb(
  path,
  content,
  color,
  range,
  icon = null
) {
  path.push(
    new Breadcrumb(
      content,
      color,
      new monaco.Position(range.startLineNumber, range.startColumn),
      icon
    )
  );
}

export function walkFactory(path, position) {
  return function walk(node) {
    if (!node) return false;
    if (!node.range?.containsPosition(position)) return false;

    switch (node.type) {
      case "CallExpression":
        for (const argi in node.args) {
          if (walk(node.args[argi]) || node.args[argi].range?.containsPosition(position)) {
            pushBreadcrumb(
              path,
              '[arg] ' + (funkyDocs.functions[node.name]?.params[argi]?.name ?? `#${Number(argi)+1}`),
              BREADCRUMBS_COLORS.ARGUMENT,
              node.args[argi].range,
              BREADCRUMBS_ICONS.ARGUMENT
            );

            break;
          }
        }

        pushBreadcrumb(
          path,
          node.name,
          BREADCRUMBS_COLORS.FUNCTION,
          node.range,
          BREADCRUMBS_ICONS.FUNCTION
        );

        return true;

      case "BinaryExpression":
        if (walk(node.left) || walk(node.right)) {
          return true;
        }

        break;

      case "UnaryExpression":
        if (walk(node.argument)) {
          return true;
        }

        break;

      case "ConditionalExpression":
        if (walk(node.test) || node.test.range?.containsPosition(position)) {
          pushBreadcrumb(
            path,
            "[test]",
            BREADCRUMBS_COLORS.CONDITIONAL,
            node.test.range,
            BREADCRUMBS_ICONS.EXPRESSION_TEST
          );
        } else if (walk(node.consequent) || node.consequent.range?.containsPosition(position)) {
          pushBreadcrumb(
            path,
            "[if]",
            BREADCRUMBS_COLORS.CONDITIONAL,
            node.consequent.range,
            BREADCRUMBS_ICONS.EXPRESSION_CONS
          );
        } else if (walk(node.alternate) || node.alternate.range?.containsPosition(position)) {
          pushBreadcrumb(
            path,
            "[else]",
            BREADCRUMBS_COLORS.CONDITIONAL,
            node.alternate.range,
            BREADCRUMBS_ICONS.EXPRESSION_ALT
          );
        }

        pushBreadcrumb(
          path,
          "[exp]",
          BREADCRUMBS_COLORS.EXPRESSION,
          node.range,
          BREADCRUMBS_ICONS.EXPRESSION
        );

        return true;

      case "Variable":
        pushBreadcrumb(
          path,
          node.name,
          BREADCRUMBS_COLORS.VARIABLE,
          node.range,
          BREADCRUMBS_ICONS.VARIABLE
        );

        return true;

      case "BooleanLiteral":
        pushBreadcrumb(
          path,
          String(node.value),
          BREADCRUMBS_COLORS.BOOLEAN,
          node.range,
          BREADCRUMBS_ICONS.BOOLEAN
        );

        return true;

      case "StringLiteral":
        pushBreadcrumb(
          path,
          `"${node.value.length >= 15
            ? node.value.slice(0, 12) + "..."
            : node.value}"`,
          BREADCRUMBS_COLORS.STRING,
          node.range,
          BREADCRUMBS_ICONS.STRING
        );

        return true;

      case "NumberLiteral":
        pushBreadcrumb(
          path,
          "number",
          BREADCRUMBS_COLORS.NUMBER,
          node.range,
          BREADCRUMBS_ICONS.NUMBER
        );

        return true;
    }

    return false;
  };
}