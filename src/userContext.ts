import { createContext } from 'react';
import { UserContextData } from '@/types';
// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
export const UserContext = createContext<UserContextData>(undefined!);
