import type { Store } from "@/lib/types/store";

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
