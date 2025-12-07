# ad-bs-dateconverter

A **React date converter** for Nepali (Bikram Sambat) and Gregorian (AD) calendars. Provides a simple interactive calendar picker and functions to convert dates **AD ⇄ BS** seamlessly.

## Features

- Convert dates between **AD and BS**.
- Interactive calendar picker for selecting dates.
- Lightweight and easy to integrate in React projects.
- Supports **React 17+**.

---

## Installation

Install via npm:

```bash
npm install ad-bs-dateconverter

or using yarn:

yarn add ad-bs-dateconverter

Basic Example
import React from 'react';
import DateConverter from 'ad-bs-dateconverter';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>AD ↔ BS Date Converter</h1>
      <DateConverter />
    </div>
  );
}

export default App;