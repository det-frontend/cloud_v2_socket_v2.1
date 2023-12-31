import mongoose from "mongoose";
import { Schema } from "mongoose";
import { encode } from "../utils/helper";
import { permitDocument } from "./permit.model";
import { roleDocument } from "./role.model";
import bcrypt from "bcryptjs";
import { stationDetailDocument } from "./stationDetail.model";
import connectDbs from "../utils/connect";
import roleModel from "./role.model";
import PermitModel from "./permit.model";
import collectionModel from "./collection.model";

const controlDb = connectDbs("controlDbUrl");

export interface UserInput {
  email: string;
  phone: number;
  name: string;
  password: string;
  accessDb:string
}

export interface UserDocument extends UserInput, mongoose.Document {
  roles: roleDocument["_id"];
  permits: permitDocument["_id"];
  stationId: stationDetailDocument["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    stationId: { type: Schema.Types.ObjectId, default: null },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: collectionModel,
      default: null,
    },
    roles: [{ type: Schema.Types.ObjectId, ref: roleModel }],
    permits: [{ type: Schema.Types.ObjectId, ref: PermitModel }],
    accessDb:{type:String}
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  let user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  let hash = encode(user.password);

  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = controlDb.model<UserDocument>("user", userSchema);

export default UserModel;
