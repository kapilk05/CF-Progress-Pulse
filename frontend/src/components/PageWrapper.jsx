// src/components/PageWrapper.jsx
import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  position: relative;
`;

export default PageWrapper;
