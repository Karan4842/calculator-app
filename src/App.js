import React, { useState, useEffect, useCallback } from "react";
// You'll need to install mathjs: npm install mathjs
import { evaluate } from 'mathjs';
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [angleMode, setAngleMode] = useState('RAD'); // 'RAD' or 'DEG'

  const handleClick = useCallback((value) => {
    setInput((prevInput) => {
      // If there's an error, the next input should start a new calculation
      if (prevInput === "Error") {
        return value;
      }
      // Prevent multiple decimals in a single number segment
      if (value === ".") {
        const segments = String(prevInput).split(/[+\-*/]/);
        if (segments.length > 0 && segments[segments.length - 1].includes(".")) {
          return prevInput; // Return previous state without change
        }
      }
      return prevInput + value;
    });
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleBackspace = useCallback(() => {
    setInput((prevInput) => {
      if (prevInput === "Error") {
        return "";
      }
      return String(prevInput).slice(0, -1);
    });
  }, []);

  const toggleAngleMode = useCallback(() => {
    setAngleMode(prev => (prev === 'RAD' ? 'DEG' : 'RAD'));
  }, []);

  const handleCalculate = useCallback(() => {
    setInput((prevInput) => {
      if (prevInput === "" || prevInput === "Error") {
        return prevInput; // No change if input is empty or already an error
      }
      try {
        // The last character should not be an operator for a valid expression
        const lastChar = String(prevInput).slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
          return "Error";
        }
        // Scope for mathjs to handle DEG/RAD conversion for trig functions
        const scope = {
          sin: (x) => angleMode === 'DEG' ? Math.sin((x * Math.PI) / 180) : Math.sin(x),
          cos: (x) => angleMode === 'DEG' ? Math.cos((x * Math.PI) / 180) : Math.cos(x),
          tan: (x) => angleMode === 'DEG' ? Math.tan((x * Math.PI) / 180) : Math.tan(x),
        };
        const result = evaluate(prevInput, scope);
        // Handle potential division by zero which results in Infinity
        if (!isFinite(result)) {
          return "Error";
        }
        return String(result);
      } catch (error) {
        return "Error";
      }
    });
  }, [angleMode]);

  // A helper to handle specific function inputs for scientific calculations
  // Note: mathjs uses radians for trig functions.
  const handleFunctionClick = (func) => {
    // Map user-friendly names to mathjs functions
    const functionMap = { 'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(', 'log': 'log10(', 'ln': 'log(', '√': 'sqrt(' };
    const valueToAppend = functionMap[func] || func;
    handleClick(valueToAppend);
  };

  // Effect for handling keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (key >= '0' && key <= '9') {
        handleClick(key);
      } else if (['+', '-', '*', '/', '.'].includes(key)) {
        handleClick(key);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevents default action (like form submission)
        handleCalculate();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClick, handleCalculate, handleBackspace, handleClear, toggleAngleMode]);

  // Define button layout for easier rendering and maintenance
  const buttonsData = [
    // Scientific Functions - Row 1
    { key: 'sin', value: 'sin', handler: () => handleFunctionClick('sin'), className: 'sci-operator' },
    { key: 'cos', value: 'cos', handler: () => handleFunctionClick('cos'), className: 'sci-operator' },
    { key: 'tan', value: 'tan', handler: () => handleFunctionClick('tan'), className: 'sci-operator' },
    { key: 'log', value: 'log', handler: () => handleFunctionClick('log'), className: 'sci-operator' },
    { key: 'ln', value: 'ln', handler: () => handleFunctionClick('ln'), className: 'sci-operator' },
    // Scientific Functions - Row 2
    { key: '(', value: '(', handler: () => handleClick('('), className: 'sci-operator' },
    { key: ')', value: ')', handler: () => handleClick(')'), className: 'sci-operator' },
    { key: 'sqrt', value: '√', handler: () => handleFunctionClick('√'), className: 'sci-operator' },
    { key: 'pow', value: '^', handler: () => handleClick('^'), className: 'sci-operator' },
    { key: 'angle', display: angleMode, handler: toggleAngleMode, className: 'sci-operator' },
    // Standard Buttons
    { key: '7', value: '7', handler: () => handleClick('7') },
    { key: '8', value: '8', handler: () => handleClick('8') },
    { key: '9', value: '9', handler: () => handleClick('9') },
    { key: 'C', value: 'C', handler: handleClear, className: 'operator' },
    { key: 'CE', value: 'CE', handler: handleBackspace, className: 'operator' },
    { key: '4', value: '4', handler: () => handleClick('4') },
    { key: '5', value: '5', handler: () => handleClick('5') },
    { key: '6', value: '6', handler: () => handleClick('6') },
    { key: '*', value: '*', handler: () => handleClick('*'), className: 'operator' },
    { key: '/', value: '/', handler: () => handleClick('/'), className: 'operator' },
    { key: '1', value: '1', handler: () => handleClick('1') },
    { key: '2', value: '2', handler: () => handleClick('2') },
    { key: '3', value: '3', handler: () => handleClick('3') },
    { key: '+', value: '+', handler: () => handleClick('+'), className: 'operator' },
    { key: '-', value: '-', handler: () => handleClick('-'), className: 'operator' },
    { key: '0', value: '0', handler: () => handleClick('0'), className: 'span-two' },
    { key: '.', value: '.', handler: () => handleClick('.') },
    { key: '=', value: '=', handler: handleCalculate, className: 'operator equals span-two' },
  ];

  return (
    <div className="App">
      <h1>React Calculator</h1>
      <div className="calculator">
        <input type="text" value={input} readOnly />
        <div className="buttons">
          {buttonsData.map((btn) => (
            <button
              key={btn.key}
              onClick={btn.handler}
              className={btn.className || ''}
            >
              {btn.display || btn.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
