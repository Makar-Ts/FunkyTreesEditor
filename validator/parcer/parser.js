import { BadToken, UnexpectedCharacter, UnexpectedToken } from "./parser-errors.js";
import * as monaco from '../../../libs/monaco-editor/main.js';

const TOKEN = {
  EOF: "EOF",

  NUMBER: "NUMBER",
  STRING: "STRING",

  IDENT: "IDENT",

  TRUE: "TRUE",
  FALSE: "FALSE",

  LPAREN: "(",
  RPAREN: ")",

  COMMA: ",",

  QUESTION: "?",
  COLON: ":",

  PLUS: "+",
  MINUS: "-",
  STAR: "*",
  SLASH: "/",
  PERCENT: "%",

  BANG: "!",

  LT: "<",
  GT: ">",

  LTE: "<=",
  GTE: ">=",

  EQ: "=",
  NEQ: "!=",

  AND: "&",
  OR: "|",
};

export class Token {
  constructor(type, value, range) {
    this.type = type;
    this.value = value;

    this.range = range;
  }
}


class Tokenizer {
  constructor(input) {
    this.input = input;

    this.pos = 0;

    this.line = 1;
    this.column = 1;
  }


  makeRange(startLine, startColumn, endLine, endColumn) {
    return new monaco.Range(
      startLine,
      startColumn,
      endLine,
      endColumn,
    );
  }

  eof() {
    return this.pos >= this.input.length;
  }

  peek(offset = 0) {
    return this.input[this.pos + offset];
  }

  advance() {
    const ch = this.input[this.pos++];

    if (ch === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return ch;
  }

  skipWhitespace() {
    while (!this.eof() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;

    let value = "";

    while (!this.eof() && /[\d.]/.test(this.peek())) {
      value += this.advance();
    }

    return new Token(
      TOKEN.NUMBER,
      Number(value),
      this.makeRange(
        startLine,
        startColumn,
        this.line,
        this.column,
      ),
    );
  }

  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;

    let value = "";

    while (!this.eof() && /[A-Za-z0-9_]/.test(this.peek())) {
      value += this.advance();
    }

    const range = this.makeRange(
      startLine,
      startColumn,
      this.line,
      this.column,
    );

    if (value === "true") {
      return new Token(TOKEN.TRUE, true, range);
    }

    if (value === "false") {
      return new Token(TOKEN.FALSE, false, range);
    }

    return new Token(TOKEN.IDENT, value, range);
  }

  readString() {
    const startLine = this.line;
    const startColumn = this.column;

    this.advance();

    let value = "";

    while (!this.eof() && this.peek() !== '"') {
      value += this.advance();
    }

    this.advance();

    return new Token(
      TOKEN.STRING,
      value,
      this.makeRange(
        startLine,
        startColumn,
        this.line,
        this.column,
      ),
    );
  }

  nextToken() {
    this.skipWhitespace();

    if (this.eof()) {
      return new Token(
        TOKEN.EOF,
        null,
        this.makeRange(
          this.line,
          this.column,
          this.line,
          this.column,
        ),
      );
    }

    const ch = this.peek();

    // numbers
    if (/\d/.test(ch)) {
      return this.readNumber();
    }

    // identifiers
    if (/[A-Za-z_]/.test(ch)) {
      return this.readIdentifier();
    }

    // strings
    if (ch === '"') {
      return this.readString();
    }

    // two-char operators

    const two = ch + this.peek(1);

    const map2 = {
      "<=": TOKEN.LTE,
      ">=": TOKEN.GTE,
      "!=": TOKEN.NEQ,
    };

    if (map2[two]) {
      const startLine = this.line;
      const startColumn = this.column;

      this.advance();
      this.advance();

      return new Token(
        map2[two],
        two,
        this.makeRange(
          startLine,
          startColumn,
          this.line,
          this.column,
        ),
      );
    }

    // one-char

    const map1 = {
      "(": TOKEN.LPAREN,
      ")": TOKEN.RPAREN,

      ",": TOKEN.COMMA,

      "?": TOKEN.QUESTION,
      ":": TOKEN.COLON,

      "+": TOKEN.PLUS,
      "-": TOKEN.MINUS,

      "*": TOKEN.STAR,
      "/": TOKEN.SLASH,
      "%": TOKEN.PERCENT,

      "!": TOKEN.BANG,

      "<": TOKEN.LT,
      ">": TOKEN.GT,

      "=": TOKEN.EQ,

      "&": TOKEN.AND,
      "|": TOKEN.OR,
    };

    if (map1[ch]) {
      const startLine = this.line;
      const startColumn = this.column;

      this.advance();

      return new Token(
        map1[ch],
        ch,
        this.makeRange(
          startLine,
          startColumn,
          this.line,
          this.column,
        ),
      );
    }

    throw new UnexpectedCharacter(ch, this.line, this.column);
  }

  tokenize() {
    const tokens = [];

    while (true) {
      const token = this.nextToken();

      tokens.push(token);

      if (token.type === TOKEN.EOF) break;
    }

    return tokens;
  }
}

const PRECEDENCE = {
  [TOKEN.QUESTION]: 1,

  [TOKEN.OR]: 2,
  [TOKEN.AND]: 3,

  [TOKEN.EQ]: 4,
  [TOKEN.NEQ]: 4,

  [TOKEN.LT]: 5,
  [TOKEN.GT]: 5,
  [TOKEN.LTE]: 5,
  [TOKEN.GTE]: 5,

  [TOKEN.PLUS]: 6,
  [TOKEN.MINUS]: 6,

  [TOKEN.STAR]: 7,
  [TOKEN.SLASH]: 7,
  [TOKEN.PERCENT]: 7,
};

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos];
  }

  previous() {
    return this.tokens[this.pos - 1];
  }

  eat(type) {
    const token = this.current();

    if (type && token.type !== type) {
      throw new BadToken(token, this.previous(), type);
    }

    this.pos++;

    return token;
  }

  parse() {
    const expr = this.parseExpression();

    this.eat(TOKEN.EOF);

    return expr;
  }

  parseExpression(precedence = 0) {
    let left = this.parsePrefix();

    while (true) {
      const token = this.current();

      const nextPrec = PRECEDENCE[token.type] || 0;

      if (nextPrec <= precedence) break;

      left = this.parseInfix(left, nextPrec);
    }

    return left;
  }

  parsePrefix() {
    const token = this.current();

    // unary
    if (token.type === TOKEN.MINUS || token.type === TOKEN.BANG) {
      this.eat();

      const argument = this.parseExpression(8);

      return {
        type: "UnaryExpression",

        operator: token.value,

        argument,

        range: this.mergeRanges(
          token.range,
          argument.range,
        ),
      };
    }

    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.current();

    // number
    if (token.type === TOKEN.NUMBER) {
      this.eat();

      return {
        type: "NumberLiteral",

        value: token.value,

        range: token.range,
      };
    }

    // string
    if (token.type === TOKEN.STRING) {
      this.eat();

      return {
        type: "StringLiteral",

        value: token.value,

        range: token.range,
      };
    }

    // booleans
    if (token.type === TOKEN.TRUE || token.type === TOKEN.FALSE) {
      this.eat();

      return {
        type: "BooleanLiteral",

        value: token.value,

        range: token.range,
      };
    }

    // identifiers
    if (token.type === TOKEN.IDENT) {
      this.eat();

      // function call
      if (this.current().type === TOKEN.LPAREN) {
        const startRange = token.range;

        this.eat(TOKEN.LPAREN);

        const args = [];

        while (this.current().type !== TOKEN.RPAREN) {
          args.push(this.parseExpression());

          if (this.current().type === TOKEN.COMMA) {
            this.eat(TOKEN.COMMA);
          }
        }

        const rparen = this.eat(TOKEN.RPAREN);

        return {
          type: "CallExpression",

          name: token.value,

          args,

          range: this.mergeRanges(
            startRange,
            rparen.range,
          ),
        };
      }

      return {
        type: "Variable",

        name: token.value,

        range: token.range,
      };
    }

    // grouping
    if (token.type === TOKEN.LPAREN) {
      this.eat(TOKEN.LPAREN);

      const expr = this.parseExpression();

      this.eat(TOKEN.RPAREN);

      return expr;
    }

    throw new UnexpectedToken(token, this.previous());
  }

  parseInfix(left, precedence) {
    const token = this.current();

    // ternary
    if (token.type === TOKEN.QUESTION) {
      this.eat(TOKEN.QUESTION);

      const consequent = this.parseExpression();

      this.eat(TOKEN.COLON);

      const alternate = this.parseExpression(precedence - 1);

      return {
        type: "ConditionalExpression",

        test: left,

        consequent,
        alternate,

        range: this.mergeRanges(
          left.range, 
          alternate.range
        )
      };
    }

    // binary
    this.eat();

    const right = this.parseExpression(precedence);

    return {
      type: "BinaryExpression",

      operator: token.value,

      left,
      right,

      range: this.mergeRanges(
        left.range,
        right.range,
      ),
    };
  }

  mergeRanges(start, end) {
    return new monaco.Range(
      start.startLineNumber,
      start.startColumn,
      end.endLineNumber,
      end.endColumn,
    );
  }
}


export function parse(text) {
  const tokenizer = new Tokenizer(text);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  return parser.parse();
}
