import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Company } from './company.entity';
import { UserRole } from '../users/schemas/user.schema';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DIRECTOR,
    name: 'approval_role',
  })
  approvalRole: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
