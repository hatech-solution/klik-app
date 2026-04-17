export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_COOKIE_NAME = "lang";

const messages = {
  vi: {
    meta: {
      appTitle: "Klik",
      appDescription:
        "Nền tảng quản lý bot đa kênh cho Line, Zalo, Telegram và Instagram.",
      loginTitle: "Đăng nhập",
      loginDescription: "Đăng nhập hệ thống quản lý bot đa nền tảng.",
      registerTitle: "Đăng ký",
      registerDescription: "Đăng ký tài khoản quản trị cho hệ thống bot đa nền tảng.",
      resetTitle: "Quên mật khẩu",
      resetDescription: "Khôi phục mật khẩu tài khoản quản trị.",
      selectTitle: "Chọn nền tảng",
      selectDescription:
        "Chọn nền tảng nhắn tin để truy cập trang quản trị theo subdomain.",
      invalidPlatformTitle: "Platform không hợp lệ",
      invalidPlatformDescription: "Không tìm thấy nền tảng yêu cầu.",
      platformDescription: (platform: string) =>
        `Trang quản trị bot cho nền tảng ${platform}.`,
      dashboardTitle: "Bảng điều khiển",
      dashboardDescription: "Quản lý tích hợp nền tảng và bot.",
    },
    language: {
      label: "Ngôn ngữ",
      vi: "Tiếng Việt",
      en: "English",
    },
    header: {
      logout: "Đăng xuất",
    },
    auth: {
      common: {
        submitting: "Đang xử lý...",
        defaultError: "Có lỗi xảy ra, vui lòng thử lại.",
      },
      login: {
        title: "Đăng nhập",
        description: "Sử dụng email và mật khẩu để truy cập hệ thống.",
        noAccount: "Chưa có tài khoản?",
        createAccount: "Tạo tài khoản",
        forgotPassword: "Quên mật khẩu?",
        submit: "Đăng nhập",
      },
      register: {
        title: "Đăng ký tài khoản",
        description: "Tạo tài khoản quản trị để bắt đầu kết nối nền tảng nhắn tin.",
        hasAccount: "Đã có tài khoản?",
        login: "Đăng nhập",
        submit: "Tạo tài khoản",
      },
      reset: {
        title: "Khôi phục mật khẩu",
        description: "Nhập email để nhận hướng dẫn đặt lại mật khẩu.",
        backToLogin: "Quay lại",
        login: "đăng nhập",
        submit: "Gửi liên kết đặt lại mật khẩu",
        success: "Đã gửi email hướng dẫn đặt lại mật khẩu (mock).",
      },
      fields: {
        email: "Email",
        password: "Mật khẩu",
        phone: "Số điện thoại",
        displayName: "Tên hiển thị",
      },
    },
    selectPlatform: {
      title: "Chọn nền tảng",
      description:
        "Sau khi đăng nhập, chọn platform để đi tới dashboard theo wildcard subdomain.",
      loading: "Đang tải danh sách nền tảng...",
      loadError: "Không tải được danh sách nền tảng. Vui lòng thử lại sau.",
      noPlatforms: "Hiện không có nền tảng nào khả dụng.",
      gotoSubdomain: "Đi đến subdomain",
      platformDescriptions: {
        line: "Kết nối và chăm sóc khách hàng trên LINE OA.",
        zalo: "Quản lý tương tác người dùng trên Zalo OA.",
        telegram: "Tự động hoá chatbot cho Telegram channel và group.",
        instagram: "Chăm sóc inbox Instagram theo workflow bán hàng.",
      },
    },
    dashboard: {
      titleSuffix: "Admin",
      subtitle: (platform: string) =>
        `Quản trị bot và hội thoại trên nền tảng ${platform}.`,
      currentBot: "Bot hiện tại:",
      chooseBot: "-- Chọn bot --",
      menuTitle: "Menu quản trị",
      noBotTitle: (platform: string) => `Chưa có bot cho ${platform}`,
      noBotDescription:
        "Tạo bot đầu tiên để bắt đầu quản lý store, user và conversation.",
      inputBotName: "Nhập tên bot",
      createBot: "Tạo bot",
      selectBotTitle: "Chọn bot để tiếp tục",
      selectBotDescription: "Bot sẽ được lưu vào session storage theo từng platform.",
      quickCreateBot: "Tạo nhanh bot mới",
      selectedBot: "Bot đang chọn",
      editBot: "Sửa",
      deleteBot: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      deleteConfirm: "Bạn có chắc chắn muốn xóa bot này?",
      section: {
        store: {
          title: "Quản lý store",
          description:
            "Quản lý thông tin cửa hàng, danh mục, trạng thái hoạt động và kết nối bot.",
        },
        user: {
          title: "Quản lý user",
          description:
            "Danh sách user đã kết bạn / nhắn tin với bot, kèm thông tin phân nhóm và tag.",
        },
        conversation: {
          title: "Quản lý conversation",
          description:
            "Theo dõi hội thoại, phân loại trạng thái xử lý và mô phỏng hàng chờ phản hồi.",
        },
      },
      stats: {
        total: "Tổng bản ghi",
        active: "Đang hoạt động",
        pending: "Cần xử lý",
      },
    },
    store: {
      addStore: "Thêm cửa hàng",
      editStore: "Sửa thông tin",
      deleteStore: "Xoá cửa hàng",
      name: "Tên cửa hàng",
      address: "Địa chỉ",
      status: "Trạng thái",
      phone: "Số điện thoại",
      actions: "Hành động",
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      deleteConfirm: "Bạn có chắc chắn muốn xoá cửa hàng này?",
      save: "Lưu",
      cancel: "Hủy",
    },
    notFound: {
      title: "Không tìm thấy trang",
      description: "Kiểm tra lại subdomain hoặc đường dẫn bạn vừa truy cập.",
      backToLogin: "Quay về đăng nhập",
    },
  },
  en: {
    meta: {
      appTitle: "Klik",
      appDescription:
        "Multi-channel bot management platform for Line, Zalo, Telegram and Instagram.",
      loginTitle: "Login",
      loginDescription: "Sign in to the multi-platform bot management system.",
      registerTitle: "Register",
      registerDescription:
        "Create an admin account for the multi-platform bot management system.",
      resetTitle: "Reset Password",
      resetDescription: "Recover your admin account password.",
      selectTitle: "Select Platform",
      selectDescription: "Choose a messaging platform to access subdomain dashboard.",
      invalidPlatformTitle: "Invalid Platform",
      invalidPlatformDescription: "Requested platform was not found.",
      platformDescription: (platform: string) =>
        `Bot administration dashboard for ${platform}.`,
      dashboardTitle: "Dashboard",
      dashboardDescription: "Manage platform integration and bots.",
    },
    language: {
      label: "Language",
      vi: "Tiếng Việt",
      en: "English",
    },
    header: {
      logout: "Logout",
    },
    auth: {
      common: {
        submitting: "Processing...",
        defaultError: "Something went wrong, please try again.",
      },
      login: {
        title: "Login",
        description: "Use your email and password to access the system.",
        noAccount: "Don't have an account?",
        createAccount: "Create account",
        forgotPassword: "Forgot password?",
        submit: "Login",
      },
      register: {
        title: "Create account",
        description: "Create an admin account to connect messaging platforms.",
        hasAccount: "Already have an account?",
        login: "Login",
        submit: "Register",
      },
      reset: {
        title: "Reset password",
        description: "Enter your email to receive reset instructions.",
        backToLogin: "Back to",
        login: "login",
        submit: "Send reset link",
        success: "Reset password email has been sent (mock).",
      },
      fields: {
        email: "Email",
        password: "Password",
        phone: "Phone",
        displayName: "Display name",
      },
    },
    selectPlatform: {
      title: "Select Platform",
      description:
        "After login, choose a platform to navigate to wildcard-subdomain dashboard.",
      loading: "Loading platforms...",
      loadError: "Could not load platforms. Please try again later.",
      noPlatforms: "No platforms are available right now.",
      gotoSubdomain: "Go to subdomain",
      platformDescriptions: {
        line: "Connect and support customers on LINE OA.",
        zalo: "Manage customer interactions on Zalo OA.",
        telegram: "Automate chatbot workflows for Telegram channels and groups.",
        instagram: "Handle Instagram inbox workflows for social commerce.",
      },
    },
    dashboard: {
      titleSuffix: "Admin",
      subtitle: (platform: string) =>
        `Manage bots and conversations on ${platform}.`,
      currentBot: "Current bot:",
      chooseBot: "-- Select bot --",
      menuTitle: "Admin menu",
      noBotTitle: (platform: string) => `No bot found for ${platform}`,
      noBotDescription:
        "Create your first bot to start managing stores, users, and conversations.",
      inputBotName: "Enter bot name",
      createBot: "Create bot",
      selectBotTitle: "Select a bot to continue",
      selectBotDescription:
        "The selected bot_id will be stored in session storage per platform.",
      quickCreateBot: "Quick create a new bot",
      selectedBot: "Selected bot",
      editBot: "Edit",
      deleteBot: "Delete",
      save: "Save",
      cancel: "Cancel",
      deleteConfirm: "Are you sure you want to delete this bot?",
      section: {
        store: {
          title: "Store management",
          description:
            "Manage store information, catalog, active status, and bot bindings.",
        },
        user: {
          title: "User management",
          description:
            "User list who already connected/chatted with this bot, including tags and segments.",
        },
        conversation: {
          title: "Conversation management",
          description:
            "Track conversations, classify processing states, and mock support queue.",
        },
      },
      stats: {
        total: "Total records",
        active: "Active",
        pending: "Needs attention",
      },
    },
    store: {
      addStore: "Add store",
      editStore: "Edit info",
      deleteStore: "Delete store",
      name: "Store name",
      address: "Address",
      status: "Status",
      phone: "Phone number",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      deleteConfirm: "Are you sure you want to delete this store?",
      save: "Save",
      cancel: "Cancel",
    },
    notFound: {
      title: "Page not found",
      description: "Please check the subdomain or URL you just accessed.",
      backToLogin: "Back to login",
    },
  },
} as const;

export function resolveLocale(locale: string | null | undefined): Locale {
  if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }
  return DEFAULT_LOCALE;
}

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false;
  }
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const normalized = acceptLanguage.toLowerCase();
  if (normalized.includes("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export function getMessages(locale: Locale) {
  return messages[locale];
}
