import mongoose from 'mongoose';

declare global {
  var mongoose: {
    cached: typeof import("mongoose"); conn: mongoose.Connection | null; promise: Promise<mongoose.Mongoose> | null 
};
}
