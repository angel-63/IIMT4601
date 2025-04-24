import mongoose from 'mongoose';

interface IRoute extends mongoose.Document {
  route_id: string;
  route_name: string;
  // stops: mongoose.Types.ObjectId[];
  stops: [{
    stop_id: string,
    order: string,
    arrival_times: string[],
    shift_ids: string[],
  }]
  fare: string;
  schedule: string;
  start: string,
  end: string
}

const RouteSchema = new mongoose.Schema<IRoute>({
  route_id: { type: String, required: true, unique: true },
  route_name: { type: String, required: true },
  // stops: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Stop',
  // }],
  stops: [{
    stop_id: {type: String, required: true, unique: true},
    order: {type: String, required: true},
    arrival_times: [{type: String, required: true}],
  }],
  fare: { type: String, required: true },
  schedule: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
});

// Prevent model recompilation in hot-reload
export default mongoose.models?.Route || mongoose.model<IRoute>('Route', RouteSchema, 'route');