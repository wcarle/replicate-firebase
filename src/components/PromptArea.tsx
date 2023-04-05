import React from 'react';
import { UserContext } from '@/userContext';
import { PromptText } from './PromptText';
import { PromptList } from './PromptList';

export const PromptArea = ({ userId }: { userId: string }) => {
  return (
    <UserContext.Provider
      value={{
        userId,
      }}
    >
      <PromptText />
      <PromptList />
    </UserContext.Provider>
  );
};
