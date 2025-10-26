import { useContext } from 'react';
import { EditorContext } from './editor-context';

export const useEditor = () => {
  const { editor, loading } = useContext(EditorContext);
  return { editor, loading };
};
