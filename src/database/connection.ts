import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  username: "root",
  password: "parav111",
  database: "FakeDatabase",
  host: "localhost",
  dialect: "mysql",
  logging: false,
  models:[__dirname+"/models"]
})




export default sequelize;