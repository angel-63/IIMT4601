import mongoose, { Schema } from 'mongoose';

interface ITrip {
  trip_id: string;
  reservation_id: string;
}

interface ICardInfo {
  number: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface ISettings {
  darkMode: boolean;
  locationAccessEnabled: boolean;
  notificationsEnabled: boolean;
  reservationReminder: boolean;
  reservedSeatReminder: boolean;
  allocatedShiftReminder: boolean;
  reservedSeatReminderBeforeMinutes: number;
}

interface IUser extends mongoose.Document {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  trip_history: ITrip[];
  bookmarked: string[];
  cardInfo?: ICardInfo;
  settings: ISettings;
}

const TripSchema = new Schema({
  trip_id: { type: String, required: true },
  reservation_id: { type: String, required: true },
});

const CardInfoSchema = new Schema({
  number: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvv: { type: String, required: true },
  cardholderName: { type: String, required: true },
});

const SettingsSchema = new Schema({
  darkMode: { type: Boolean, default: false },
  locationAccessEnabled: { type: Boolean, default: true },
  notificationsEnabled: { type: Boolean, default: true },
  reservationReminder: { type: Boolean, default: true },
  reservedSeatReminder: { type: Boolean, default: true },
  allocatedShiftReminder: { type: Boolean, default: true },
  reservedSeatReminderBeforeMinutes: { type: Number, default: 15 },
});

const UserSchema = new Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  trip_history: [TripSchema],
  bookmarked: [{ type: String }],
  cardInfo: { type: CardInfoSchema, required: false },
  settings: { type: SettingsSchema, default: () => ({}) },
});

export default mongoose.model<IUser>('User', UserSchema, 'userInfo');