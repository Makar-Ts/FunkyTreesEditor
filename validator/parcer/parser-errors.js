import { Position } from "../../libs/monaco-editor/main.js";
import { Token } from "./parser.js";


export class UnexpectedCharacter extends Error {
  constructor(char, line, column) {
    super(`Unexpected character "${char}"`);

    this.char = char;
    this.line = line;
    this.column = column;
    this.position = new Position(line, column);
  }
}


export class UnexpectedToken extends Error {
  /** 
   * @param {Token} token  
   * @param {Token} previousToken 
   */
  constructor(token, previousToken) {
    super(`Unexpected token ${token.type}`);

    this.token = token;
    this.previousToken = previousToken;

    if (previousToken) {
      this.position = new Position(previousToken.line, previousToken.column);
    } else {
      this.position = new Position(token.line, token.column);
    }
  }
}

export class BadToken extends Error {
  /** 
   * @param {Token} token  
   * @param {Token} previousToken 
   */
  constructor(token, previousToken, expectedToken) {
    super(`Expected ${expectedToken}, got ${token.type}`);

    this.token = token;
    this.previousToken = previousToken;
    this.expectedToken = expectedToken;

    if (previousToken) {
      this.position = new Position(previousToken.line, previousToken.column);
    } else {
      this.position = new Position(token.line, token.column);
    }
  }
}