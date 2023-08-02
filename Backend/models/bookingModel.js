const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  BookingId: {
    type: String,
    unique: true,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  CoachId: {
    type: String,
    required: true,
  },
  DateOfAppointment: {
    type: Date,
    required: true,
    validate: {
      validator: dateValidate,
      message: "Appoinment date must be within the upcoming 7 days and more than current time",
    },
  },
  Slot: {
    type: String,
    required: true,
    validate: {
      validator: slotValidate,
      message:
        'Slot should be of 1 hour and in the format like "9 AM to 10 AM"',
    },
  },
});

function dateValidate(value) {

  const today = new Date();
  const DOA = new Date(value);
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  //getYear = from 1900
  const DOA_UTC = Date.UTC(DOA.getFullYear(), DOA.getMonth(), DOA.getDate());
  const today_UTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diff = Math.floor((DOA_UTC - today_UTC) / _MS_PER_DAY);

  if (diff > 0 && diff < 8) {
    return true;
  }

  if (diff == 0) {
    const slotArray = this.Slot.split(" ");
    let t1 = Number(slotArray[0]);
    const s1 = slotArray[1];

    if (s1 === "PM") {
      if (t1 !== 12) {
        t1 += 12;
      }
    } else {
      if (t1 === 12) {
        t1 = 0;
      }
    }
    if (t1 < today.getHours() + 1) {
      return false;
    }
  }
  return true;
}

function slotValidate(value) {

  const slotRegex = /^(\d{1,2}\s(?:AM|PM))\sto\s(\d{1,2}\s*(?:AM|PM))$/;

  if (!slotRegex.test(value)) {
    return false;
  }
  console.log("slot")
  const slotArray = value.split(" ");

  let t1 = Number(slotArray[0]);
  let t2 = Number(slotArray[3]);

  console.log(slotArray);

  if (t1 > 12 || t2 > 12 || t1 < 0 || t2 < 0) {
    return false;
  }

  if (slotArray[1] === "AM") {
    if (t1 === 12) {
      t1 = 0;
    }
  } else {
    if (t1 === 0) {
      return false;
    } else if (t1 !== 12) {
      t1 += 12;
    }
  }

  if (slotArray[4] === "AM") {
    if (t2 === 12 || t2 === 0) {
      t2 = 24;
    }
  } else {
    if (t2 === 0) {
      return false;
    } else if (t2 !== 12) {
      t2 += 12;
    }
  }

  if (t2 - t1 !== 1) {
    return false;
  }

  return true;
}

module.exports = mongoose.model("Booking", bookingSchema);
