import React from 'react';
import './FloatingInput.css';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  bgContext?: '#111' | '#0a0a0a';
  isTextArea?: boolean;
  rows?: number;
}

export default function FloatingInput({ 
  label, 
  bgContext = '#111', 
  isTextArea = false, 
  rows = 5,
  ...props 
}: FloatingInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={`inputGroup ${isTextArea ? 'textarea' : ''}`} style={{ '--bg-context': bgContext } as React.CSSProperties}>
      {isTextArea ? (
        <textarea 
          placeholder=" " 
          rows={rows} 
          {...props} 
        />
      ) : (
        <input 
          placeholder=" " 
          {...props} 
        />
      )}
      <label>{label}</label>
    </div>
  );
}
