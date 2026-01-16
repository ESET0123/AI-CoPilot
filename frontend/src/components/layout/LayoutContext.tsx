import { createContext, useContext } from 'react';

export type LayoutContextType = {
    mobileOpened: boolean;
    toggleMobile: () => void;
    hasSidebar: boolean;
};

export const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        return {
            mobileOpened: false,
            toggleMobile: () => { },
            hasSidebar: false,
        };
    }
    return context;
};
