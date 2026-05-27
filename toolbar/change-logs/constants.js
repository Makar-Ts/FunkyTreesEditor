export const CHANGE_LOGS_HTML_TEMPLATE = `
<div class="change-logs">
  <div class="change-logs-header">
    <span class="change-logs-name">{{name}}</span>
    <span class="change-logs-date">{{date}}</span>
  </div>
  <div class="content">{{content}}</div>
  <div class="tags">{{tags}}</div>
</div>
`;


export const CHANGE_LOGS = [
  {
    name: "0.6.1",
    tags: ["0.6.1", "0.6.1.b6", "0.6.1.b5", "0.6.1.b4", "0.6.1.b3", "0.6.1.b2", "0.6.1.b1"],
    date: new Date(2026, 5, 27),
    content: `<p>Added a top bar displaying breadcrumbs, the cursor position, and the number of functions.</p>
<p>Tabs now change not just the text, but the Text Model (preserving the change history).</p>
<p>Fixed a bug where validation did not occur if there were no fields, as well as the check for duplicate fields.</p>
<p>The number of changelogs displayed at a time is now limited.</p>`,
  },
  {
    name: "0.6.0",
    tags: ["0.6.0.1", "0.6.0"],
    date: new Date(2026, 5, 19),
    content: `<p>Added the ability to import plane XML files.</p>
<p>Toolbar design slightly updated.</p>`,
  },
  {
    name: "0.5.3",
    tags: ["0.5.3"],
    date: new Date(2026, 5, 19),
    content: `<p>Added a loading screen and a slightly improved changelog modal.</p>`,
  },
  {
    name: "0.5.2",
    tags: ["0.5.2"],
    date: new Date(2026, 5, 18),
    content: `<p>Added tags for Discord's Embeds, Favicon and aria-labels.</p>`,
  },
  {
    name: "0.5.1",
    tags: ["0.5.1"],
    date: new Date(2026, 5, 18),
    content: `<p>Added Google Analytics.</p>`,
  },
  {
    name: "0.5.0",
    tags: ["0.5.0", "0.5.0.b3", "0.5.0.b2", "0.5.0.b1"],
    date: new Date(2026, 5, 18),
    content: `<p>The syntax for defining fields has changed 
(you must now start with the "|>" symbol), and you can now 
specify the priority and function activator using ";" (optional).
Updated the default expression to reflect changes in syntax.</p>

<p>Change logs have been added.</p>

<p>Codicon font for Monaco Editor have been added.</p>`,
  },
];
