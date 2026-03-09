export type GearCondition = "new" | "like-new" | "good" | "fair";

export type GearCategory =
  | "shoes"
  | "apparel"
  | "accessories"
  | "medals"
  | "electronics"
  | "other";

export interface GearListing {
  id: string;
  title: string;
  description: string;
  category: GearCategory;
  condition: GearCondition;
  size?: string;
  quantity: number;
  images: string[];
  donorId: string;
  createdAt: string;
  claimed: boolean;
}

export interface GearRequest {
  id: string;
  organizationName: string;
  description: string;
  category: GearCategory;
  sizeRange?: string;
  quantity: number;
  urgency: "low" | "medium" | "high";
  requesterId: string;
  createdAt: string;
  fulfilled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "donor" | "requester";
  organization?: string;
  location: string;
  createdAt: string;
}
