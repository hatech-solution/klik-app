import { create } from 'zustand';

interface PlatformState {
    platformId: string | null;
    setPlatform: (platformId: string) => void;
    loadFromStorage: () => void;
    clearPlatform: () => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
    platformId: null,

    setPlatform: (platformId) => {
        localStorage.setItem('platform_id', platformId);
        set({ platformId });
    },

    loadFromStorage: () => {
        if (typeof window !== 'undefined') {
            const pId = localStorage.getItem('platform_id');
            if (pId) {
                document.documentElement.setAttribute('data-platform', pId);
            } else {
                document.documentElement.removeAttribute('data-platform');
            }
            set({ platformId: pId });
        }
    },

    clearPlatform: () => {
        localStorage.removeItem('platform_id');
        document.documentElement.removeAttribute('data-platform');
        set({ platformId: null });
    }
}));
