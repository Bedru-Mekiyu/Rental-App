export function getPagination(req, options = {}) {
  const defaultLimit = options.defaultLimit ?? 50;
  const maxLimit = options.maxLimit ?? 100;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Math.max(rawLimit || defaultLimit, 1), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta({ page, limit, total }) {
  const pages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, pages };
}
