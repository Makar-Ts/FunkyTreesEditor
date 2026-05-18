import { BadToken, UnexpectedCharacter, UnexpectedToken } from "./parser-errors.js";

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
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;

    this.line = line;
    this.column = column;
  }
}

class Tokenizer {
  constructor(input) {
    this.input = input;

    this.pos = 0;

    this.line = 1;
    this.column = 1;
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

    return new Token(TOKEN.NUMBER, Number(value), startLine, startColumn);
  }

  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;

    let value = "";

    while (!this.eof() && /[A-Za-z0-9_]/.test(this.peek())) {
      value += this.advance();
    }

    if (value === "true") {
      return new Token(TOKEN.TRUE, true, startLine, startColumn);
    }

    if (value === "false") {
      return new Token(TOKEN.FALSE, false, startLine, startColumn);
    }

    return new Token(TOKEN.IDENT, value, startLine, startColumn);
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

    return new Token(TOKEN.STRING, value, startLine, startColumn);
  }

  nextToken() {
    this.skipWhitespace();

    if (this.eof()) {
      return new Token(TOKEN.EOF, null, this.line, this.column);
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
      this.advance();
      this.advance();

      return new Token(map2[two], two, this.line, this.column - 2);
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
      this.advance();

      return new Token(map1[ch], ch, this.line, this.column - 1);
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

      return {
        type: "UnaryExpression",

        operator: token.value,

        argument: this.parseExpression(8),

        line: token.line,
        column: token.column,
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

        line: token.line,
        column: token.column,
      };
    }

    // string
    if (token.type === TOKEN.STRING) {
      this.eat();

      return {
        type: "StringLiteral",

        value: token.value,

        line: token.line,
        column: token.column,
      };
    }

    // booleans
    if (token.type === TOKEN.TRUE || token.type === TOKEN.FALSE) {
      this.eat();

      return {
        type: "BooleanLiteral",

        value: token.value,

        line: token.line,
        column: token.column,
      };
    }

    // identifiers
    if (token.type === TOKEN.IDENT) {
      this.eat();

      // function call
      if (this.current().type === TOKEN.LPAREN) {
        this.eat(TOKEN.LPAREN);

        const args = [];

        while (this.current().type !== TOKEN.RPAREN) {
          args.push(this.parseExpression());

          if (this.current().type === TOKEN.COMMA) {
            this.eat(TOKEN.COMMA);
          }
        }

        this.eat(TOKEN.RPAREN);

        return {
          type: "CallExpression",

          name: token.value,

          args,

          line: token.line,
          column: token.column,
        };
      }

      return {
        type: "Variable",

        name: token.value,

        line: token.line,
        column: token.column,
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

        line: token.line,
        column: token.column,
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

      line: token.line,
      column: token.column,
    };
  }
}


export function parse(text) {
  const tokenizer = new Tokenizer(text);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  return parser.parse();
}
