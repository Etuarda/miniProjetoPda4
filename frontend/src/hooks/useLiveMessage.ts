import { useState } from 'react';

/**
 * Hook para gerenciar mensagens live region para screen readers.
 * Melhora acessibilidade anunciando mudanças importantes na interface.
 */
export function useLiveMessage() {
  const [ariaMessage, setAriaMessage] = useState('');

  /**
   * Anuncia mensagem temporária para tecnologias assistivas.
   * Mensagem desaparece automaticamente após 2.5 segundos.
   */
  function announce(message: string) {
    setAriaMessage(message);
    window.setTimeout(() => setAriaMessage(''), 2500);
  }

  return { ariaMessage, announce };
}
