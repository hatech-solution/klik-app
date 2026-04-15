import { PlatformId } from "@/lib/platforms";

export type Bot = {
  id: string;
  name: string;
};

export const INITIAL_BOTS: Record<PlatformId, Bot[]> = {
  line: [
    { id: "line-bot-001", name: "LINE Support Bot" },
    { id: "line-bot-002", name: "LINE Sales Assistant" },
  ],
  zalo: [{ id: "zalo-bot-001", name: "Zalo CSKH Bot" }],
  telegram: [{ id: "telegram-bot-001", name: "Telegram Auto Reply" }],
  instagram: [],
};

export type Store = {
  id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
  phoneNumber: string;
};

export const INITIAL_STORES: Record<string, Store[]> = {
  "line-bot-001": [
    {
      id: "store-line-1",
      name: "Cửa hàng Quận 1",
      address: "123 Lê Lợi, Bến Nghé, Quận 1, TP.HCM",
      status: "active",
      phoneNumber: "0901234567",
    },
    {
      id: "store-line-2",
      name: "Chi nhánh Đống Đa",
      address: "456 Nguyễn Lương Bằng, Đống Đa, Hà Nội",
      status: "inactive",
      phoneNumber: "0987654321",
    },
  ],
  "zalo-bot-001": [
    {
      id: "store-zalo-1",
      name: "Zalo Shop Chính",
      address: "Tòa nhà VNG, Z06 Đường 13, Quận 7, TP.HCM",
      status: "active",
      phoneNumber: "19001234",
    },
  ],
};

export const DASHBOARD_SECTIONS = [
  {
    id: "store",
    title: "Quản lý store",
    description:
      "Quản lý thông tin cửa hàng, danh mục, trạng thái hoạt động và kết nối bot.",
  },
  {
    id: "user",
    title: "Quản lý user",
    description:
      "Danh sách user đã kết bạn / nhắn tin với bot, kèm thông tin phân nhóm và tag.",
  },
  {
    id: "conversation",
    title: "Quản lý conversation",
    description:
      "Theo dõi hội thoại, phân loại trạng thái xử lý và mô phỏng hàng chờ phản hồi.",
  },
] as const;
