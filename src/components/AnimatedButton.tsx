import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ text, className = '', ...props }) => {
  const letters = text.split('');
  
  return (
    <button className={`animated-btn ${className}`} {...props}>
      <div className="original">{text}</div>
      <div className="letters">
        {letters.map((char, index) => (
          <span 
            key={index} 
            style={{ transitionDelay: `${index * 0.05}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </button>
  );
};

export default AnimatedButton;
