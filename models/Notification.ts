import mongoose from 'mongoose';

interface INotification extends mongoose.Document {
  reservation_id: string;
  message: string;
  send_time: Date;
  user_id: string;
  status: 'Pending' | 'Sent' | 'Failed';
  type: 'ReservationReminder' | 'AllocatedShiftReminder' | 'ReservedSeatReminder';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>({
  reservation_id: { type: String, required: true },
  message: { type: String, required: true },
  send_time: { type: Date, required: true },
  user_id: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Sent', 'Failed'], 
    default: 'Pending' 
  },
  type: {
    type: String,
    required: true,
    enum: ['ReservationReminder', 'AllocatedShiftReminder', 'ReservedSeatReminder'],
  },
}, { timestamps: true });

// Prevent model recompilation in hot-reload
export default mongoose.models?.Notification || mongoose.model<INotification>('Notification', NotificationSchema, 'notification');