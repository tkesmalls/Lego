export type CollectionStatus = 'owned' | 'wanted' | 'for_sale';
export type SetCondition = 'new' | 'used' | 'sealed';
export type PriceType = 'purchased' | 'sold' | 'estimated';

export interface CollectionSet {
  id?: number;
  set_num: string;
  name: string;
  year?: number;
  theme?: string;
  num_parts?: number;
  image_url?: string;
  status: CollectionStatus;
  quantity: number;
  condition: SetCondition;
  notes?: string;
  purchase_price?: number;
  current_value?: number;
  date_added?: string;
  date_acquired?: string;
}

export interface StoredMinifigure {
  id?: number;
  fig_num: string;
  name: string;
  num_parts?: number;
  image_url?: string;
  set_num: string;
  quantity_in_set: number;
  quantity_owned: number;
}

export interface StoredPart {
  id?: number;
  set_num: string;
  part_num: string;
  part_name?: string;
  color?: string;
  quantity_in_set: number;
  quantity_have: number;
  image_url?: string;
}

export interface PriceEntry {
  id?: number;
  set_num: string;
  price: number;
  currency: string;
  price_type?: PriceType;
  date?: string;
  notes?: string;
}

// Rebrickable API response shapes
export interface RebrickableSet {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string;
  set_url: string;
  last_modified_dt: string;
}

export interface RebrickableMinifig {
  id: number;
  set_num: string;
  set_name: string;
  quantity: number;
  fig_num: string;
  num_parts: number;
  name: string;
  set_img_url: string;
}

export interface RebrickablePart {
  id: number;
  inv_part_id: number;
  part: {
    part_num: string;
    name: string;
    part_url: string;
    part_img_url: string | null;
  };
  color: {
    id: number;
    name: string;
    rgb: string;
    is_trans: boolean;
  };
  num_sets: number;
  num_set_variants: number;
  quantity: number;
  is_spare: boolean;
  element_id: string | null;
}

export interface RebrickableTheme {
  id: number;
  parent_id: number | null;
  name: string;
}

export interface RebrickablePaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
