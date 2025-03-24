"use client";

import React, { createContext, useContext, useState } from "react";

// Define a more specific type for modal data
type ModalData = unknown;

interface ModalContextType {
  data: Record<string, ModalData>;
  isOpen: Record<string, boolean>;
  canClose: Record<string, boolean>;
  setCanClose: (modalId: string, canClose: boolean) => void;
  setOpen: (
    modal: React.ReactNode,
    fetchdata?: () => Promise<ModalData>,
    modalId?: string
  ) => void;
  setClose: (modalId?: string) => void;
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: {},
  canClose: {},
  setOpen: () => {},
  setClose: () => {},
  setCanClose: () => {},
});

interface ModalProviderProps {
  children: React.ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<Record<string, ModalData>>({});
  const [modals, setModals] = useState<Record<string, React.ReactNode>>({});
  const [canClose, setCanCloseState] = useState<Record<string, boolean>>({});

  const setOpen = async (
    modal: React.ReactNode,
    fetchdata?: () => Promise<ModalData>,
    modalId: string = "default"
  ) => {
    if (fetchdata) {
      const fetchedData = await fetchdata();
      setData((prev) => ({ ...prev, [modalId]: fetchedData || null }));
    }
    setIsOpen((prev) => ({ ...prev, [modalId]: true }));
    setModals((prev) => ({ ...prev, [modalId]: modal }));
    // Only update canClose if needed.
    setCanCloseState((prev) =>
      prev[modalId] === true ? prev : { ...prev, [modalId]: true }
    );
  };

  const setClose = (modalId: string = "default") => {
    if (canClose[modalId] !== false) {
      setIsOpen((prev) => ({ ...prev, [modalId]: false }));
      setData((prev) => ({ ...prev, [modalId]: null }));
      setModals((prev) => {
        const newState = { ...prev };
        delete newState[modalId];
        return newState;
      });
      setCanCloseState((prev) => {
        const newState = { ...prev };
        delete newState[modalId];
        return newState;
      });
    }
  };

  const setCanClose = (modalId: string, value: boolean) => {
    setCanCloseState((prev) => {
      // Only update if the value changes
      if (prev[modalId] === value) return prev;
      return { ...prev, [modalId]: value };
    });
  };

  return (
    <ModalContext.Provider
      value={{ data, isOpen, canClose, setOpen, setClose, setCanClose }}
    >
      {children}
      {Object.entries(modals).map(
        ([id, modal]) =>
          isOpen[id] && <React.Fragment key={id}>{modal}</React.Fragment>
      )}
    </ModalContext.Provider>
  );
};

export default ModalProvider;

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
