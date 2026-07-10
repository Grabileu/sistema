import React, { createContext, useContext } from 'react';

export type NavigationContextType = {
  currentPage: string;
  navigate: (page: string) => void;
  editingEmployeeId: string | null;
  setEditingEmployeeId: (id: string | null) => void;
};

export const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'dashboard',
  navigate: () => {},
  editingEmployeeId: null,
  setEditingEmployeeId: () => {}
});

export const useNavigation = () => useContext(NavigationContext);

export default NavigationContext;
