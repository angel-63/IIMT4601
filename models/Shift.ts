import mongoose from 'mongoose';

interface IShift extends mongoose.Document {
  route_id: string;
  progress: number;
  latitude: number;
  longitude: number;
  available_seats: number;
  reservations_id: string[];
  start_time: Date;
  arrival_time: Date;
  minibus_id: string;
  trip_id: string;
  shift_id: string;
}

const ShiftSchema = new mongoose.Schema<IShift>({
  route_id: { type: String, required: true },
  progress: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  available_seats: { type: Number, required: true },
  reservations_id: { type: [String], default: [] },
  start_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  minibus_id: { type: String, required: true },
  trip_id: { type: String, required: true, unique: true },
  shift_id: { type: String, required: true, unique: true },
});

export default mongoose.models?.Shift || mongoose.model<IShift>('Shift', ShiftSchema, 'shift');