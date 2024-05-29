import { Table,BelongsTo,HasOne,Scopes,IsUUID,ForeignKey,PrimaryKey,DataType,Column,Model,CreatedAt,UpdatedAt,BeforeCreate,HasMany } from "sequelize-typescript";
import Questions from "./Questions"
import CorOptions from "./CorOptions";

@Table({
    timestamps:true,
})
class OptionSets extends Model{
    @Column({
        type: DataType.UUID,
        primaryKey:true,
        defaultValue: DataType.UUIDV4
    })
    declare id:string;
    
    @Column
    declare option: string;

    @ForeignKey(() => Questions)
    @Column({
        type: DataType.UUID,
    })
    declare questionId:string;

    @BelongsTo(() => Questions,"questionId")
    declare question: Questions;

    @HasOne(() => CorOptions)
    declare corOption: CorOptions;

}
export default OptionSets;