export interface RestaurantGroupSummary {
  id: string;
  name: string;
  slug: string;
}

export interface BranchSummary {
  id: string;
  name: string;
  address?: string | null;
  timezone: string;
  isActive: boolean;
  restaurantId: string;
}
