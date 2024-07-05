const mongoose = require("mongoose");

mongoose.connect("mongodb://0.0.0.0:27017/react-login-tut")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log('failed');
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const serviceProviderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Define schema for reviews
const reviewSchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  reviewText: {
    type: String,
    required: true
  }
});

// Add schema for pending service provider requests
const pendingServiceProviderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);
const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);
const Admin = mongoose.model("Admin", adminSchema);

// Create model for pending service provider requests
const PendingServiceProvider = mongoose.model("PendingServiceProvider", pendingServiceProviderSchema);

// Create model for reviews
const Review = mongoose.model("Review", reviewSchema);

module.exports = { User, ServiceProvider, Admin, PendingServiceProvider, Review };
