import express from "express";
import cors from "cors";
import Users from "./database/models/Users";
import Questions from "./database/models/Questions";
import CorOptions from "./database/models/CorOptions";
import OptionSets from "./database/models/OptionSets";
import sequelize from "./database/connection";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
const salt = bcrypt.genSaltSync(10)
var auth = require("./auth");
var authAdmin = require("./authAdmin");
const PORT = process.env.PORT || 3001;
const app = express();
dotenv.config()
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Xss-Protection", "1; mode=block");
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Content-Security-Policy", "script-src 'self'");
  next();
});

//login
app.post("/login", async (req, res) => {
  try{
    let { email, password } = req.body;
  
    // const hashedPassword = bcrypt.hashSync(password, salt) // hash created previously created upon sign up
    let existingUser;
    if(!process.env.JWT_SECRET) throw Error("invalid key")
    existingUser = await Users.findOne({
      raw: true,
      attributes: ["id", "email", "password", "role"],
      where: { email: email },
    });
    const doesPasswordMatch = bcrypt.compareSync(password, existingUser!.password)
    if (!existingUser ||!doesPasswordMatch) {
      res
        .status(401)
        .json({ message: "authentication failed, please check details" });
    } else {
      let token = jwt.sign(
        {
          userId: existingUser!.id,
          email: existingUser!.email,
          role: existingUser!.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "success",
        userData: {
          userId: existingUser!.id,
          email: existingUser!.email,
          // role: existingUser!.role,
          token: token,
        },
      });
    }
  }
  catch(err){
    return res.status(500).json({"error": "Soemthing went wrong"})
  }
});

app.post("/signup", async (req, res) => {
  let { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, salt) // hash created previously created upon sign up
  if(!process.env.JWT_SECRET) throw Error("invalid key")
  try {
    let newUser= await Users.create({
      email: email,
      password: hashedPassword,
      role: "user",
    },{returning:true});
    
    let token;
    token = jwt.sign(
      {
        userId: newUser!.id,
        email: newUser!.email, //id role add in
        role: newUser!.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "success",
      userData: {
        userId: newUser!.id,
        email: newUser!.email,
        // role: newUser!.role,
        token: token,
      },
    });
  } catch (error:any) {
    console.log(error)
    if(error.name === 'SequelizeUniqueConstraintError'){
      res.status(400).json({message:'this email has been used already'})
    }
  }
});

//auth api
app.get("/userprofile", auth, (req, res, next) => {

    res.status(200).json({
      message: "success",
      data: {
        userId: res.locals.currentUser.userId,
        email: res.locals.currentUser.email,
        // role: decodedToken.role,
      },
    });
});


let length = 0;
let message = "";
app.get("/addQues", auth, authAdmin, async (req, res) => {
  // await sequelize.sync()
  //use transcitions
  let questions: any = await Questions.findAll({
    raw: true,
  });
  length = questions.length;
  res.status(200).json({ message, length: length });
});

//database
app.post("/addQues", auth,authAdmin, async (req, res) => {
  message = "";
  let { ques, options, corOption } = req.body;
  // console.log(ques, "option", options, "corOption", corOption);
  let transaction  = await sequelize.transaction()
  try {
    let question = await Questions.create({
      question: ques.question,
    },{returning: true,transaction });
    await OptionSets.create({
      option: options.option1,
      questionId: question.id,
    },{transaction });
    await OptionSets.create({
      option: options.option2,
      questionId: question.id,
    },{transaction });
    await OptionSets.create({
      option: options.option3,
      questionId: question.id,
    },{transaction });
    console.log(corOption,question.id)
    let corOptionId: any = await OptionSets.findOne({
      raw: true,
      attributes: ["id"],
      where: { option: corOption,questionId: question.id},
      transaction
    });
    corOptionId = corOptionId.id;
    await CorOptions.create({
      questionId: question.id,
      corOptionId: corOptionId,
    },{transaction});
    await transaction.commit();
    console.log("commited")
  } catch (err: any) {
    await transaction.rollback()
    console.log(err)
    if (err.errors) {
      err.errors.map((er: { path: string | number; message: any }) => {
        message = er.message;
      });
    } else message = err;
  }
  if (message === "") message = "succcess";
  res.status(200).json({ message, length: length });
});

app.post("/", auth, async (req, res) => {
  // console.log(auth.email)
  let score = 0;
  let newSelect: { questionId: string; optionId: string }[] = [];
  let corOption: { corOptionId: string; questionId: string }[] = [];
  corOption = await CorOptions.findAll({
    raw: true,
    attributes: ["corOptionId", "questionId"],
    order: [["createdAt", "DESC"]],
  });
  newSelect = req.body.newSelect;
  // console.log(newSelect,"-----", corOption);
  // console.log(corOption);
  if (newSelect.length === corOption.length) {
    newSelect.map((element)=>{
      if(corOption.some((val)=>{
        return element.optionId === val.corOptionId
      })){score++}
    })
  }

  res.status(200).json({ message: "success", score });
});

app.get("/", auth, async (req, res) => {
  let questions = await Questions.findAll({
    raw: true,
    attributes: ["question", "id"],
    order: [["createdAt", "DESC"]],
  });
  let newQue = questions.map(async (que) => {
    const options = await OptionSets.findAll({
      raw: true,
      attributes: ["option", "id"],
      order: [["createdAt", "DESC"]],
      where: { questionId: que.id },
    });
    // corOption = await CorOptions.findAll({
    //   raw: true,
    //   attributes: ["corOptionId", "questionId"],
    //   order: [["createdAt", "DESC"]],
    //   where: { questionId: que.id },
    // });
    return { ...que, options };
  });

  Promise.all(newQue).then((values) => {
    res.status(200).json({ message: "success", data: { values } });
  });
});

app.delete("/", async (req, res) => {
  res.status(200).json({ message: "success" });
});

app.put("/", async (req, res) => {
  res.status(200).json({ message: "success" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
