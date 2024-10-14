export function createPagination(data: {
  count: number;
  page: number;
  perPage: number;
}) {
  const skip = (data.page - 1) * data.perPage;
  const totalPage = Math.ceil(data.count / data.perPage);
  const take = data.perPage;

  return { skip, totalPage, take };
}
