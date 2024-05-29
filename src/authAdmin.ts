import { error } from "console";
import express from "express";
import { Request, Response, NextFunction} from 'express'
import jwt from "jsonwebtoken";
require('dotenv').config()
const app = express();
module.exports = (req:Request, res:Response, next:NextFunction) => {
  try {
    if (res.locals.currentUser.role !== 'admin') {
      throw 'Invalid Info';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};