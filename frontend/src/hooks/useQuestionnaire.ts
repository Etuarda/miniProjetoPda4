import { useEffect, useState } from 'react';
import { getQuestions } from '../services/question.service';
import { Question } from '../types';

/**
 * Hook personalizado para gerenciar estado das questões do questionário.
 * Carrega dados automaticamente na montagem do componente.
 */
export function useQuestionnaire() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getQuestions();
      setQuestions(data);
      setIsLoading(false);
    }
    void load();
  }, []);

  return { questions, isLoading };
}
