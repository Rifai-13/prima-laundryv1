import { Schema, model, models, Document } from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expires: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  expires: { 
    type: Date, 
    required: true 
  }
});

export default models.Session || model<ISession>("Session", sessionSchema);