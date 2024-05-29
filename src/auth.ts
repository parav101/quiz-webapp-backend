import express from "express";
import { Request, Response, NextFunction} from 'express'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import Users from "./database/models/Users";
import sequelize from "./database/connection";
dotenv.config()
const app = express();
module.exports = (req:Request, res:Response, next:NextFunction) => {
  try {
    const token = req.headers.authorization!.split(' ')[1];
    if(!process.env.JWT_SECRET) throw Error("invalid key")
    const decodedToken:any = jwt.verify(token, process.env.JWT_SECRET,);
    // const userId = decodedToken.userId;
    const email = decodedToken.email;
    // module.exports.email = email;
    if (req.body.email && req.body.email !== email) {
      throw 'Invalid user ID';
    } else {
      Users.findOne({
        where: {
          email: email
        }
      }).then((currentUser: any) => {
        if(!currentUser) return res.status(500).json({
          error: "User not found"
        })
        else{
          res.locals.currentUser = currentUser
          return next();
        }
      }).catch((err: any) => {
        return res.status(500).json({
          error: "Something went wrong"
        })
      })
    }
  } catch {
    return res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};