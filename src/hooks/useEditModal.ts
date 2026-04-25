import { useState, useCallback } from 'react';

/**
 * Hook genérico para gerenciar modais de edição com estado controlado.
 * Recebe o valor inicial (ou função) e retorna:
 * - open: boolean (modal aberto)
 * - setOpen: setter do open
 * - values: estado dos campos
 * - setValues: setter dos campos
 * - handleOpen: função para abrir e preencher valores
 * - handleChange: função para alterar campo específico
 * - handleSubmit: função para submeter e fechar modal
 */
export function useEditModal<T extends object>(initialValues: T, onSubmit?: (values: T) => void) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<T>(initialValues);

  // Abre o modal e preenche valores
  const handleOpen = useCallback((newValues?: Partial<T>) => {
    setValues(v => ({ ...v, ...newValues }));
    setOpen(true);
  }, []);

  // Altera campo específico
  const handleChange = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value } as T));
  }, []);

  // Submete e fecha
  const handleSubmit = useCallback(() => {
    if (onSubmit) onSubmit(values);
    setOpen(false);
  }, [onSubmit, values]);

  // Fecha modal
  const handleClose = useCallback(() => setOpen(false), []);

  return {
    open,
    setOpen,
    values,
    setValues,
    handleOpen,
    handleChange,
    handleSubmit,
    handleClose,
  };
}
