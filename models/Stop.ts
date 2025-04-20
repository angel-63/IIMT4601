const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
    latitude: { type: String, required: true },
    longitutde: { type: String, required: true },
    name: {type: String, required: true},
    stop_id: {type: String, required: true}
})
  

const Stop = mongoose.model('Stop', StopSchema);

export default mongoose.model('Stop', StopSchema);