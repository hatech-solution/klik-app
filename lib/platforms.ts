export type PlatformId = "line" | "zalo" | "telegram" | "instagram";

export type PlatformConfig = {
  id: PlatformId;
  name: string;
  logo: string;
  headerClassName: string;
  accentClassName: string;
  hoverClassName: string;
  description: string;
};

export const PLATFORM_IDS: PlatformId[] = [
  "line",
  "zalo",
  "telegram",
  "instagram",
];

export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
  line: {
    id: "line",
    name: "LINE",
    logo: "/logos/line.svg",
    headerClassName: "bg-emerald-600 text-white",
    accentClassName: "bg-emerald-600 text-white",
    hoverClassName: "hover:bg-emerald-700",
    description: "Kết nối và chăm sóc khách hàng trên LINE OA.",
  },
  zalo: {
    id: "zalo",
    name: "Zalo",
    logo: "/logos/zalo.svg",
    headerClassName: "bg-sky-600 text-white",
    accentClassName: "bg-sky-600 text-white",
    hoverClassName: "hover:bg-sky-700",
    description: "Quản lý tương tác người dùng trên Zalo OA.",
  },
  telegram: {
    id: "telegram",
    name: "Telegram",
    logo: "/logos/telegram.svg",
    headerClassName: "bg-cyan-600 text-white",
    accentClassName: "bg-cyan-600 text-white",
    hoverClassName: "hover:bg-cyan-700",
    description: "Tự động hoá chatbot cho Telegram channel và group.",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    logo: "/logos/instagram.svg",
    headerClassName: "bg-fuchsia-600 text-white",
    accentClassName: "bg-fuchsia-600 text-white",
    hoverClassName: "hover:bg-fuchsia-700",
    description: "Chăm sóc inbox Instagram theo workflow bán hàng.",
  },
};

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORM_IDS.includes(value as PlatformId);
}
