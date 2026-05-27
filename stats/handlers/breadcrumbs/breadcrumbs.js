import { editor } from "../../../editor/main.js";
import { ON_VALIDATION_ENDED } from "../../../validator/constant.js";
import { toLocalPosition } from "../../../utils/to-local-position.js";
import { Breadcrumb, BREADCRUMBS_COLORS, BREADCRUMBS_ICONS, walkFactory } from "./node-walker.js";
import * as monaco from '../../../libs/monaco-editor/main.js';
import { toGlobalPosition } from "../../../utils/to-global-position.js";

const breadcrumbs = document.getElementById('breadcrumbs');


let lastVariables = [];
function updateBreadcrumbs(position) {
  const path = [];

  if (!lastVariables.length) {
    breadcrumbs.innerHTML = "";
    return;
  }

  for (const variable of lastVariables) {
    const name = new Breadcrumb(
      variable.name?.content,
      BREADCRUMBS_COLORS.FIELD,
      new monaco.Position(variable.name.range.startLineNumber, variable.name.range.startColumn),
      BREADCRUMBS_ICONS.FIELD
    );

    if (variable.name?.range.containsPosition(position)) {
      path.push(name);
      break;
    }

    if (variable.priority?.range.containsPosition(position)) {
      path.push(
        name,
        new Breadcrumb(
          "[priority]",
          BREADCRUMBS_COLORS.FIELD,
          new monaco.Position(variable.priority.range.startLineNumber, variable.priority.range.startColumn),
          "list-ordered"
        )
      );
      break;
    }

    if (variable.activator?.range.containsPosition(position)) {
      path.push(
        name,
        new Breadcrumb(
          "[activator]",
          BREADCRUMBS_COLORS.FIELD,
          new monaco.Position(variable.priority.range.startLineNumber, variable.priority.range.startColumn),
          "pulse"
        )
      );

      if (!variable.activator.parsed) break;


      const innerPath = []
      walkFactory(innerPath, toLocalPosition(position, variable.activator.range))(variable.activator.parsed);

      path.push(...(innerPath.map(v => {
        v.startPosition = toGlobalPosition(v.startPosition, variable.activator.range);
        return v;
      }).toReversed()));


      break;
    }

    if (variable.content?.range.containsPosition(position)) {
      path.push(
        name,
        new Breadcrumb(
          "[content]",
          BREADCRUMBS_COLORS.FIELD,
          new monaco.Position(variable.content.range.startLineNumber, variable.content.range.startColumn),
          "file"
        )
      );

      if (!variable.content.parsed) break;


      const innerPath = []
      walkFactory(innerPath, toLocalPosition(position, variable.content.range))(variable.content.parsed);

      path.push(...(innerPath.map(v => {
        v.startPosition = toGlobalPosition(v.startPosition, variable.content.range);
        return v;
      }).toReversed()));

      
      break;
    }
  }


  breadcrumbs.innerHTML = '';
  for (const bc of path) {
    const a = document.createElement('a');

    a.setAttribute('href', `${bc.startPosition.lineNumber}:${bc.startPosition.column}`)

    if (bc.icon) {
      const i = document.createElement('i');
      i.classList = 'codicon codicon-'+bc.icon;
      a.appendChild(i)
    }

    const s = document.createElement('span');
    s.innerText = bc.content;
    a.appendChild(s);

    a.style.color = bc.color;

    breadcrumbs.appendChild(a);
  }

  breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
}


breadcrumbs.addEventListener('click', function(e) {
  const targetElement = e.target.closest('#breadcrumbs > a');
  
  if (targetElement) {
    e.preventDefault();

    const [line, column] = targetElement.getAttribute('href').split(':').map(Number);
    console.log(line, column, targetElement.getAttribute('href'))
    
    const pos = {
      lineNumber: line,
      column: column
    };

    editor.revealPositionInCenter(pos);
    editor.setPosition(pos);
    editor.focus();
  }
});


editor.onDidChangeCursorPosition((e) => {
  updateBreadcrumbs(e.position);
})

globalThis.addEventListener(ON_VALIDATION_ENDED, (e) => {
  lastVariables = e.detail.variables;
  console.log(lastVariables);

  updateBreadcrumbs(editor.getPosition());
})