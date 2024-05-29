import { Table,Scopes,IsUUID,BelongsTo,ForeignKey,PrimaryKey,DataType,Column,Model,CreatedAt,UpdatedAt,BeforeCreate,HasMany } from "sequelize-typescript";

@Table({
    timestamps:true,
})
class Users extends Model{
    @Column({
        type: DataType.UUID,
        primaryKey:true,
        defaultValue: DataType.UUIDV4
    })
    declare id:string;

    @Column({
        unique: true
    })
    declare email: string;

    @Column
    declare password: string;

    @Column
    declare role: string;
}
export default Users;