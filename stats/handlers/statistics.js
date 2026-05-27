import { ON_VALIDATION_ENDED } from "../../validator/constant.js";

const variablesAmount = document.getElementById('statistics_variables_amount');

globalThis.addEventListener(ON_VALIDATION_ENDED, (e) => {
  const { variables } = e.detail;

  variablesAmount.innerText = String(variables.filter(v => v.name?.content).length);
})