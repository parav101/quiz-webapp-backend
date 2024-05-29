import { Table,Scopes,IsUUID,BelongsTo,ForeignKey,PrimaryKey,DataType,Column,Model,CreatedAt,UpdatedAt,BeforeCreate,HasMany } from "sequelize-typescript";
import Questions from "./Questions"
import OptionSets from "./OptionSets"
import { UUID } from "crypto";



@Table({
    timestamps:true,
})
class CorOptions extends Model{
   
    // @IsUUID(4)
    // @PrimaryKey
    // @Column
    // declare id: string;
    
    @ForeignKey(() => Questions)
    @Column({
        type: DataType.UUID,
    })
    declare questionId:string;

    @BelongsTo(() => Questions,"questionId")
    declare question: Questions;

    @ForeignKey(() => OptionSets)
    @Column({
        type: DataType.UUID,
    })
    declare corOptionId:string;

    @BelongsTo(() =>  OptionSets,"optionId")
    declare corOption: OptionSets;
}
export default CorOptions;