import { Range, Position } from '../libs/monaco-editor/main.js'

/**
 * @param {Position} position 
 * @param {Range} contentRange 
 */
export function toLocalPosition(position, contentRange) {
  return new Position(
    position.lineNumber - contentRange.startLineNumber + 1,
    position.lineNumber === contentRange.startLineNumber ? position.column - contentRange.startColumn : position.column
  )
}