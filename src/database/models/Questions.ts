import { Table,IsUUID,PrimaryKey,DataType,Column,Model,CreatedAt,UpdatedAt,BeforeCreate,HasMany,HasOne } from "sequelize-typescript";
import OptionSets from "./OptionSets"; 
import CorOptions from "./CorOptions";

@Table({
    timestamps:true,
})
class Questions extends Model{
     @Column({
        type: DataType.UUID,
        primaryKey:true,
        defaultValue: DataType.UUIDV4
    })
    declare id:string;
    
    @Column({
        unique: true
    })
    declare question: string;
    
    @HasMany(() => OptionSets)
    declare options: OptionSets[];

    @HasOne(() => CorOptions)
    declare corOption: CorOptions;
}
export default Questions;