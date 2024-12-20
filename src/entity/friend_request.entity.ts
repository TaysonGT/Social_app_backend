import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('friend_requests')
export class FriendRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sender_id: string;

    @Column()
    receiver_id: string;

    @Column({type: 'text', default: "pending"})
    status: string;

    @CreateDateColumn()
    created_at: Date;
}