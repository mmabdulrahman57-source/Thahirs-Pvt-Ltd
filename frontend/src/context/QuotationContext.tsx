import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface QuotationItem {
  productId?: string;
  productName: string;
  productCode?: string;
  category?: string;
  description?: string;
  quantity: number;
  unit: string;
  preferredBrand?: string;
  requiredDate?: string;
  deliveryLocation?: string;
  specialNotes?: string;
  referenceFile?: string;
}

interface QuotationContextType {
  items: QuotationItem[];
  addItem: (item: QuotationItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: Partial<QuotationItem>) => void;
  clear: () => void;
}

const QuotationContext = createContext<QuotationContextType>({
  items: [], addItem: () => {}, removeItem: () => {}, updateItem: () => {}, clear: () => {},
});

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuotationItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('thahirs_quote') || '[]'); } catch { return []; }
  });

  const save = useCallback((newItems: QuotationItem[]) => {
    setItems(newItems);
    localStorage.setItem('thahirs_quote', JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: QuotationItem) => {
    setItems(prev => {
      const next = [...prev, item];
      localStorage.setItem('thahirs_quote', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((i: number) => {
    setItems(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      localStorage.setItem('thahirs_quote', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateItem = useCallback((i: number, data: Partial<QuotationItem>) => {
    setItems(prev => {
      const next = prev.map((item, idx) => idx === i ? { ...item, ...data } : item);
      localStorage.setItem('thahirs_quote', JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => save([]), [save]);

  return (
    <QuotationContext.Provider value={{ items, addItem, removeItem, updateItem, clear }}>
      {children}
    </QuotationContext.Provider>
  );
}

export const useQuotation = () => useContext(QuotationContext);
