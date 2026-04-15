'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/store/usePlatformStore';

interface RouteGuardProps {
    children: React.ReactNode;
    locale: string;
}

export const RouteGuard = ({ children, locale }: RouteGuardProps) => {
    const router = useRouter();
    const { loadFromStorage, platformId } = usePlatformStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Luôn load từ storage khi component mount
        loadFromStorage();
        const pId = localStorage.getItem('platform_id');

        // Nếu chưa có platformId thì dội lại trang chọn Platform
        if (!pId) {
            router.replace(`/${locale}/platform-select`);
        } else {
            setIsReady(true);
        }
    }, [router, locale, platformId, loadFromStorage]);

    // Trong lúc chờ check trạng thái (tránh nháy UI)
    if (!isReady) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="text-gray-500 animate-pulse">Loading Platform...</div>
            </div>
        );
    }

    return <>{children}</>;
};
