// Shared style and label maps for categories, need statuses, and pledge statuses.

export const VALID_CATEGORIES = ["shoes", "apparel", "accessories", "other"] as const;
export type CategoryTag = (typeof VALID_CATEGORIES)[number];

export const categoryStyles: Record<string, string> = {
  shoes: "bg-[#2D4A2D] text-white",
  apparel: "bg-blue-600 text-white",
  accessories: "bg-amber-600 text-white",
  other: "bg-gray-500 text-white",
};

export const categoryLabels: Record<string, string> = {
  shoes: "Shoes",
  apparel: "Apparel",
  accessories: "Accessories",
  other: "Other",
};

export const needStatusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  partially_fulfilled: "bg-amber-50 text-amber-700 border-amber-200",
  fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
};

export const needStatusLabels: Record<string, string> = {
  active: "Active",
  partially_fulfilled: "Partially Fulfilled",
  fulfilled: "Fulfilled",
  expired: "Expired",
};

export const pledgeStatusStyles: Record<string, string> = {
  pending: "bg-gray-50 text-gray-600 border-gray-200",
  collecting: "bg-amber-50 text-amber-700 border-amber-200",
  ready_to_deliver: "bg-green-50 text-green-700 border-green-200",
  delivered: "bg-blue-50 text-blue-700 border-blue-200",
  withdrawn: "bg-red-50 text-red-600 border-red-200",
};

export const pledgeStatusLabels: Record<string, string> = {
  pending: "Pending",
  collecting: "Collecting",
  ready_to_deliver: "Ready to Deliver",
  delivered: "Delivered",
  withdrawn: "Withdrawn",
};
