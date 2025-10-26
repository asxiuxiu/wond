import type { WondEditor } from '@wond/core';
import { createContext } from 'react';

export const EditorContext = createContext<{
  editor: WondEditor | null;
  loading: boolean;
}>({
  editor: null,
  loading: true,
});
