import type { IWondEditor } from '@wond/core';
import { createContext } from 'react';

export const EditorContext = createContext<{
  editor: IWondEditor | null;
  loading: boolean;
}>({
  editor: null,
  loading: true,
});
