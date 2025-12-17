import React, { createContext, useContext, useState } from 'react';
import { Toast, ConfirmationModal } from '../components/ui';

interface NotificationContextType {
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirm: (message: string, onConfirm: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType>({ notify: () => {}, confirm: () => {} });

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'error' | 'info'}[]>([]);
  const [modalState, setModalState] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const confirm = (message: string, onConfirm: () => void) => {
    setModalState({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setModalState(null);
  };

  const handleConfirm = () => {
    if (modalState?.onConfirm) modalState.onConfirm();
    closeConfirm();
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Global UI Elements */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
        {toasts.map(t => (
          <Toast key={t.id} id={t.id} message={t.message} type={t.type} onDismiss={dismissToast} />
        ))}
      </div>
      
      <ConfirmationModal 
        isOpen={!!modalState} 
        message={modalState?.message || ''} 
        onConfirm={handleConfirm} 
        onCancel={closeConfirm} 
      />
    </NotificationContext.Provider>
  );
};