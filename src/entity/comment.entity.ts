import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
    id: string;
  
  @Column()
    user_id: string;
  
  @Column()
    post_id: string;
    
  @Column()
    content: string;
    
  @CreateDateColumn()
    created_at: Date;
}