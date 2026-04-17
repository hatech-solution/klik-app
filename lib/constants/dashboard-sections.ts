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

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number]["id"];
