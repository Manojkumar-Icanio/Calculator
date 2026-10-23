const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelectorAll(".key");

let current = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let lastExpression = "";

function formatValue(value) {
  if (value === "Error") return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return "Error";
  return number.toLocaleString("en-US", { maximumFractionDigits: 10, useGrouping: false });
}

function render() {
  display.textContent = formatValue(current);
  expression.textContent = lastExpression || "\u00a0";
}

function reset() {
  current = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  lastExpression = "";
  render();
}

function inputNumber(number) {
  if (current === "Error" || waitingForOperand) {
    current = number;
    waitingForOperand = false;
  } else {
    current = current === "0" ? number : current + number;
  }
  lastExpression = "";
  render();
}

function inputDecimal() {
  if (current === "Error" || waitingForOperand) {
    current = "0.";
    waitingForOperand = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  render();
}

function calculate(left, right, operator) {
  const a = Number(left);
  const b = Number(right);
  if (operator === "+") return a + b;
  if (operator === "−") return a - b;
  if (operator === "×") return a * b;
  if (operator === "÷") return b === 0 ? Infinity : a / b;
  return b;
}

function chooseOperator(operator) {
  if (current === "Error") return;
  const inputValue = Number(current);
  if (storedValue === null) {
    storedValue = inputValue;
  } else if (pendingOperator && !waitingForOperand) {
    storedValue = calculate(storedValue, inputValue, pendingOperator);
    current = String(storedValue);
  }
  pendingOperator = operator;
  waitingForOperand = true;
  lastExpression = `${formatValue(String(storedValue))} ${operator}`;
  render();
}

function completeCalculation() {
  if (pendingOperator === null || storedValue === null) return;
  const left = storedValue;
  const right = Number(current);
  const result = calculate(left, right, pendingOperator);
  lastExpression = `${formatValue(String(left))} ${pendingOperator} ${formatValue(String(right))} =`;
  current = Number.isFinite(result) ? String(result) : "Error";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  render();
}

function backspace() {
  if (waitingForOperand || current === "Error") return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

function percent() {
  if (current === "Error") return;
  current = String(Number(current) / 100);
  render();
}

function handleAction(action) {
  if (action === "clear") reset();
  if (action === "backspace") backspace();
  if (action === "decimal") inputDecimal();
  if (action === "percent") percent();
  if (action === "calculate") completeCalculation();
}

function pressKey(key) {
  const button = [...keys].find((item) => item.dataset.number === key || item.dataset.operator === key || item.dataset.action === key);
  if (!button) return;
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 120);
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    if (key.dataset.number) inputNumber(key.dataset.number);
    if (key.dataset.operator) chooseOperator(key.dataset.operator);
    if (key.dataset.action) handleAction(key.dataset.action);
  });
});

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (/\d/.test(key)) {
    event.preventDefault();
    inputNumber(key);
    pressKey(key);
  } else if (key === ".") {
    event.preventDefault();
    inputDecimal();
    pressKey("decimal");
  } else if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    const operator = { "+": "+", "-": "−", "*": "×", "/": "÷" }[key];
    chooseOperator(operator);
    pressKey(operator);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    completeCalculation();
    pressKey("calculate");
  } else if (key === "Backspace") {
    event.preventDefault();
    backspace();
    pressKey("backspace");
  } else if (key === "%") {
    event.preventDefault();
    percent();
    pressKey("percent");
  } else if (key === "Escape") {
    reset();
    pressKey("clear");
  }
});

render();
