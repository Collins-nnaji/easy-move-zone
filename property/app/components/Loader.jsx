import React from 'react';
import styled, { keyframes } from 'styled-components';

// Spin animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Pulse animation
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: var(--color-bg);
`;

const LoaderSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-green-chip);
  border-top: 4px solid var(--color-green-deep);
  border-radius: 50%;
  animation: 
    ${spin} 1s linear infinite,
    ${pulse} 1.5s ease-in-out infinite;
`;

const Loader = () => {
  return (
    <LoaderContainer>
      <LoaderSpinner />
    </LoaderContainer>
  );
};

export default Loader;