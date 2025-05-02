import mongoose from 'mongoose';

interface IReservation extends Document { 
    status: 'Pending' | 'Completed' | 'Cancelled'; 
    date: Date; 
    pickup_location: string; 
    dropoff_location: string; 
    seat: number; 
    reservation_id: string; 
    reservation_status: 'Pending' | 'Completed' | 'Cancelled'; 
    shift_id: string; 
    user_id: string; 
    payment_status: 'Pending' | 'Completed' | 'Failed'; 
    trip_id: string; 
    route_id: string; 
    createdAt: Date; 
    updatedAt: Date; 
}

const ReservationSchema = new mongoose.Schema<IReservation>({ 
    status: { type: String, required: true, enum: ['Reserved', 'Completed', 'Cancelled'] },
    date: { type: Date, required: true },
    pickup_location: { type: String, required: true },
    dropoff_location: { type: String, required: true },
    seat: { type: Number, required: true },
    reservation_id: { type: String, required: true, unique: true },
    reservation_status: { type: String, required: true, enum: ['Reserved', 'Completed', 'Cancelled'] },
    shift_id: { type: String, required: false, default: "" },
    user_id: { type: String, required: true },
    payment_status: { type: String, required: true, enum: ['Pending', 'Completed', 'Failed'] },
    trip_id: { type: String, required: false, unique: true },
    route_id: { type: String, required: true } 
});

// Prevent model recompilation in hot-reload
export default mongoose.models?.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema, 'reservation');