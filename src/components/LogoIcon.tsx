import React from 'react';

interface LogoIconProps {
  size?: number;
  color?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill={color} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path d="M0 24h320c106 0 192 86 192 192 0 88-60 162-142 184l142 112h-172l-140-112h-40v112H0V24zm160 136v120h144c44 0 80-36 80-60s-36-60-80-60H160z" />
    </svg>
  );
};
