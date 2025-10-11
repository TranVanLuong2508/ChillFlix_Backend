import { SelectQueryBuilder } from 'typeorm';

export function joinWithCommonFields(
  qb: SelectQueryBuilder<any>,
  relationPath: string,
  alias: string,
  commonFields = ['keyMap', 'valueEn', 'valueVi', 'description'],
) {
  //   const fields = ['keyMap', 'valueEn', 'valueVi', 'description'];
  qb.leftJoin(relationPath, alias);
  qb.addSelect(commonFields.map((f) => `${alias}.${f}`));
  return qb;
}
