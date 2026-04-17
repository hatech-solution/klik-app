export type StoreStatus = "active" | "inactive";

export type Store = {
  id: string;
  name: string;
  address: string;
  status: StoreStatus;
  phoneNumber: string;
};
