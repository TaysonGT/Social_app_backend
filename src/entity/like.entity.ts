import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn('uuid')
    id: string;
  
  @Column()
    user_id: string;
  
  @Column()
    type: string;
  
  @Column({type: 'text', nullable: true})
    post_id: string | null;
  
  @Column({type: 'text', nullable: true})
    comment_id: string | null;
  
}