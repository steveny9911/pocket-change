export type EntryCategoryLabel = string;

export interface Category {
  label: EntryCategoryLabel;
  icon: string;
}

export const DEFAULT_CATEGORY: Category = {
  label: "",
  icon: "line-dashed",
};
