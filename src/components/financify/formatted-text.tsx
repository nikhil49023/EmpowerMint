'use client';

import React from 'react';

// This regex will find all instances of CURRENCY{...} and **...**
const formattingRegex = /(CURRENCY\{.*?\})|(\*\*.*?\*\*)/g;

type FormattedTextProps = {
  text: string;
};

export function FormattedText({ text }: FormattedTextProps) {
  if (!text) {
    return null;
  }

  // Split the text by our formatting tokens
  const parts = text.split(formattingRegex).filter(Boolean);

  const formattedParts = parts.map((part, index) => {
    // Check for currency format: CURRENCY{...}
    if (part.startsWith('CURRENCY{') && part.endsWith('}')) {
      const currencyText = part.slice('CURRENCY{'.length, -1);
      return (
        <strong key={index} className="text-primary font-bold">
          {currencyText}
        </strong>
      );
    }
    
    // Check for bold format: **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold">
          {boldText}
        </strong>
      );
    }

    // Handle newline characters and render them as <br>
    const lines = part.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line}
        {lineIndex < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

    return <span key={index}>{lines}</span>;
  });

  return (
    <p className="text-muted-foreground whitespace-pre-line">
      {formattedParts}
    </p>
  );
}
