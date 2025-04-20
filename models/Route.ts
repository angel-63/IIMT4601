import mongoose from 'mongoose';

interface IRoute extends mongoose.Document {
  route_id: string;
  route_name: string;
  stops: mongoose.Types.ObjectId[];
  fare: string;
  schedule: string;
}

const RouteSchema = new mongoose.Schema<IRoute>({
  route_id: { type: String, required: true },
  route_name: { type: String, required: true },
  stops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
  }],
  fare: { type: String, required: true },
  schedule: { type: String, required: true }
});

// Prevent model recompilation in hot-reload
export default mongoose.models?.Route || mongoose.model<IRoute>('Route', RouteSchema, 'route');