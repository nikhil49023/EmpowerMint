
'use client';

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';

const formattingRegex = /(VAR\{[^}]*\})/g;

type InteractiveDprContentProps = {
  text: string;
  initialVariables?: Record<string, string>;
};

export type InteractiveDprContentHandle = {
  getVariables: () => Record<string, string>;
  getContent: () => string;
};

const InteractiveDprContent = forwardRef<InteractiveDprContentHandle, InteractiveDprContentProps>(
  ({ text, initialVariables = {} }, ref) => {
    const [variables, setVariables] = useState<Record<string, string>>(initialVariables);

    useImperativeHandle(ref, () => ({
      getVariables: () => variables,
      getContent: () => {
         return text.split(formattingRegex).filter(Boolean).map((part) => {
            if (part.startsWith('VAR{') && part.endsWith('}')) {
              const varKey = part.slice('VAR{'.length, -1);
              return variables[varKey] || part;
            }
            return part;
         }).join('');
      }
    }));

    const handleVariableChange = (key: string, value: string) => {
      setVariables(prev => ({ ...prev, [key]: value }));
    };

    const formattedParts = useMemo(() => {
      if (!text) {
        return null;
      }
      return text.split(formattingRegex).filter(Boolean).map((part, index) => {
        if (part.startsWith('VAR{') && part.endsWith('}')) {
          const varKey = part.slice('VAR{'.length, -1);
          const placeholder = varKey.replace(/\[|\]/g, ''); // Clean up for placeholder text

          return (
            <Input
              key={index}
              type="text"
              placeholder={placeholder}
              value={variables[varKey] || ''}
              onChange={(e) => handleVariableChange(varKey, e.target.value)}
              className="inline-block w-auto h-8 p-1 border-red-300 focus:border-primary bg-red-50 text-red-700 font-semibold"
            />
          );
        }

        // Handle bold format: **...**
        const boldParts = part.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return boldParts.map((boldPart, boldIndex) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                return (
                    <strong key={`${index}-${boldIndex}`} className="font-semibold text-foreground">
                        {boldPart.slice(2, -2)}
                    </strong>
                );
            }
             // Handle newline characters
            const lines = boldPart.split('\n').map((line, lineIndex) => (
                <React.Fragment key={`${index}-${boldIndex}-${lineIndex}`}>
                {line}
                {lineIndex < boldPart.split('\n').length - 1 && <br />}
                </React.Fragment>
            ));
            return <React.Fragment key={`${index}-${boldIndex}`}>{lines}</React.Fragment>;
        });
      });
    }, [text, variables]);

    return (
      <div className="text-muted-foreground whitespace-pre-line leading-relaxed space-y-2">
        {formattedParts}
      </div>
    );
  }
);

InteractiveDprContent.displayName = 'InteractiveDprContent';
export default InteractiveDprContent;

    