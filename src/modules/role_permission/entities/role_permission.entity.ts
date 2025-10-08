import { Column, Entity } from 'typeorm';

@Entity()
export class RolePermission {
  @Column()
  roleId: number;

  @Column()
  permissionId: number;
}
