import mongoose from 'mongoose';

interface IStop extends mongoose.Document {
    latitude: number;
    longitude: number;
    name: string;
    stop_id: string;
  }

const StopSchema = new mongoose.Schema<IStop>({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    name: {type: String, required: true},
    stop_id: {type: String, required: true, unique: true}
})
  

export default mongoose.models?.Stop || mongoose.model<IStop>('Stop', StopSchema, 'stop');