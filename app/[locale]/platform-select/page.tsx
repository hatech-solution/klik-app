'use client'
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';

interface PlatformSelectPageProps {
    params: Promise<{ locale: string }>;
}

export default function PlatformSelectPage({ params }: PlatformSelectPageProps) {
    // Ở Next.js 15, params là Promise nên dùng hook `use` hoặc đợi nó resolve
    const { locale } = use(params);
    const router = useRouter();
    const { setPlatform, clearPlatform } = usePlatformStore();

    // Đảm bảo clear config cũ nếu truy cập trang chọn lại
    useEffect(() => {
        clearPlatform();
    }, [clearPlatform]);

    const handleSelect = (platformId: string) => {
        setPlatform(platformId);
        // Chuyển tới dashboard (bạn thay bằng route mong muốn)
        router.push(`/${locale}/dashboard`);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Vui lòng chọn nền tảng
                </h2>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => handleSelect('zalo')}
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        <span className="text-lg">Zalo</span>
                    </button>

                    <button
                        onClick={() => handleSelect('messenger')}
                        className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        <span className="text-lg">Messenger</span>
                    </button>

                    <button
                        onClick={() => handleSelect('telegram')}
                        className="flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        <span className="text-lg">Telegram</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
