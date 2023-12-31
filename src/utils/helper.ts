import { Response } from "express";
import config from "config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  csStationDetailModel,
  ksStationDetailModel,
} from "../model/stationDetail.model";

const saltWorkFactor = config.get<number>("saltWorkFactor");
const secretKey = config.get<string>("secretKey");
const salt = bcrypt.genSaltSync(saltWorkFactor);

//password checking and converting
export const encode = (payload: string) => bcrypt.hashSync(payload, salt);
export const compass = (payload: string, dbPass: string) =>
  bcrypt.compareSync(payload, dbPass);

//tokenization
export const createToken = (payload: {}) =>
  jwt.sign(payload, secretKey, { expiresIn: "12h" });
export const checkToken = (payload: string): any =>
  jwt.verify(payload, secretKey);

//get prev date
export let previous = (date = new Date()) => {
  let previousDate = new Date();
  previousDate.setDate(date.getDate() - 1);

  return previousDate.toLocaleDateString(`fr-CA`);
};

//for response
const fMsg = (
  res: Response,
  msg: string = "all success",
  result: any = [],
  route: string | null = null,
  totalCount: number | null = null
) => {
  if (totalCount != null) {
    res.status(200).json({ con: true, msg, route, result, totalCount });
  } else {
    res.status(200).json({ con: true, msg, result });
  }
};

export const fMsg2 = (
  res: Response,
  status: number = 200,
  msg: string = "all success",
  result: any = []
) => {
  res.status(status).json({ con: true, msg, result });
};

export const dBSelector = (dbModel: string, dbOne, dbTwo) => {
  if (dbModel === "kyaw_san") {
    return dbOne;
  } else if (dbModel === "common") {
    return dbTwo;
  } else {
    throw new Error("Invalid model name");
  }
};

export const dbDistribution = (ea) => {
  
  if (ea.accessDb === "kyaw_san") {
    return ksStationDetailModel;
  } else if (ea.accessDb === "common") {
    return csStationDetailModel;
  } else {
    return ksStationDetailModel;
  }
};

export const fuelBalanceCalculationForStockBalance = (data) => {

  let ron92_opening = 0;
  let ron95_opening = 0;
  let diesel_opening = 0;
  let pDiesel_opening = 0;
  
  let ron92_cash = 0;
  let ron95_cash = 0;
  let diesel_cash = 0;
  let pDiesel_cash = 0;
  
  let ron92_balance = 0;
  let ron95_balance = 0;
  let diesel_balance = 0;
  let pDiesel_balance = 0;

  let ron92_receive = 0;
  let ron95_receive = 0;
  let diesel_receive = 0;
  let pDiesel_receive = 0;
  
  data.map((e) => {
    if (e.fuelType === "001-Octane Ron(92)") {
      ron92_opening += e.opening;
      ron92_cash += e.cash;
      ron92_balance += e.balance;
      ron92_receive = e.fuelIn;
    }
    if (e.fuelType === "002-Octane Ron(95)") {
      ron95_opening += e.opening;
      ron95_cash += e.cash;
      ron95_balance += e.balance;
      ron95_receive = e.fuelIn;
    }
    if (e.fuelType === "004-Diesel") {
      diesel_opening += e.opening;
      diesel_cash += e.cash;
      diesel_balance += e.balance;
      diesel_receive = e.fuelIn;
    }
    if (e.fuelType === "005-Premium Diesel") {
      pDiesel_opening += e.opening;
      pDiesel_cash += e.cash;
      pDiesel_balance += e.balance;
      pDiesel_receive = e.fuelIn;
    }
  });

  return { ron92_opening, ron95_opening, diesel_opening, pDiesel_opening, ron92_cash, ron95_cash, diesel_cash, pDiesel_cash, ron92_balance, ron95_balance, diesel_balance, pDiesel_balance,ron92_receive,ron95_receive,diesel_receive,pDiesel_receive }
};

export const realTankCalculationForStockBalance = (data) => {
  let ron92 = 0;
  let ron95 = 0;
  let diesel = 0;
  let pDiesel = 0;
    
  data.forEach(element => {
    if (
      element.oilType === "Petrol 92" || element.oilType === "001-Octane Ron(92)") {
      ron92 += element.volume;
    }
    if (
      element.oilType === "95 Octane" || element.oilType === "002-Octane Ron(95)") {
      ron95 += element.volume;
    }
    if (element.oilType === "Super Diesel" || element.oilType === "005-Premium Diesel") {
      pDiesel += element.volume;
    }
    if (element.oilType === "Diesel" || element.oilType === " 004-Diesel") {
      diesel += element.volume;
    }
  });
 

  return {ron92,ron95,diesel,pDiesel}
};


export default fMsg;
