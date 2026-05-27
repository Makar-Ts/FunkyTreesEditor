import { Range, Position } from '../libs/monaco-editor/main.js'

/**
 * @param {Position} position 
 * @param {Range} contentRange 
 */
export function toGlobalPosition(position, contentRange) {
  return new Position(
    contentRange.startLineNumber + position.lineNumber - 1,
    position.lineNumber === 1 ? contentRange.startColumn + position.column : position.column
  )
}