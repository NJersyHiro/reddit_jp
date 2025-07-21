export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const perPage = Math.min(100, Math.max(1, params.perPage || 20));
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
}

export function getPaginationMeta(
  page: number,
  perPage: number,
  totalCount: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / perPage);

  return {
    page,
    perPage,
    totalPages,
    totalCount,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}