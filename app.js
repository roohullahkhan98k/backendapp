const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { User, ServiceProvider, Admin, PendingServiceProvider, Review } = require("./mongo");
const Notification = require('./models/notification');
const app = express();
const port = 8000;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", cors(), (req, res) => {});

app.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        const check = await User.findOne({ email });

        if (check) {
            res.json("exist");
        } else {
            res.json("notexist");
        }
    } catch (e) {
        res.json("fail");
    }
});

app.post("/admin-signup", async (req, res) => {
    const { email, password } = req.body;

    const adminData = {
        email,
        password
    };

    try {
        const checkAdmin = await Admin.findOne({ email });

        if (checkAdmin) {
            res.json("exist");
        } else {
            res.json("notexist");
            await Admin.create(adminData);
        }
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json("fail");
    }
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    const data = {
        email,
        password
    };

    try {
        const check = await User.findOne({ email });

        if (check) {
            res.json("exist");
        } else {
            res.json("notexist");
            await User.create(data);
        }
    } catch (error) {
        console.error("Error creating user:", error);
        res.json("fail");
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in the User collection
        const user = await User.findOne({ email });

        if (user && user.password === password) {
            res.json("user");
            return;
        }

        // Check if the user exists in the ServiceProvider collection
        const serviceProvider = await ServiceProvider.findOne({ email });

        if (serviceProvider && serviceProvider.password === password) {
            res.json("serviceProvider");
            return;
        }

        res.json("notexist");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("fail");
    }
});

app.post('/register-service-provider', async (req, res) => {
    const { email, password, profession, contact } = req.body;

    if (!email || !password || !profession || !contact) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceProviderData = {
        email,
        profession,
        password,
        contact
    };

    try {
        await PendingServiceProvider.create(serviceProviderData);
        res.json("pending");
    } catch (error) {
        console.error("Error creating service provider:", error);
        res.status(500).json("fail");
    }
});

app.get('/api/pending-service-providers', async (req, res) => {
    try {
        const pendingRequests = await PendingServiceProvider.find();
        res.json(pendingRequests);
    } catch (error) {
        console.error("Error fetching pending service provider requests:", error);
        res.status(500).json("fail");
    }
});

app.put('/api/approve-service-provider/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pendingRequest = await PendingServiceProvider.findById(id);

        if (!pendingRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Create a new ServiceProvider document with all the required fields
        await ServiceProvider.create({
            email: pendingRequest.email,
            profession: pendingRequest.profession,
            password: pendingRequest.password,
            contact: pendingRequest.contact
        });

        // Delete the corresponding pending request
        await PendingServiceProvider.findByIdAndDelete(id);

        res.json("approved");
    } catch (error) {
        console.error("Error approving service provider request:", error);
        res.status(500).json("fail");
    }
});


app.put('/api/reject-service-provider/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await PendingServiceProvider.findByIdAndDelete(id);
        res.json("rejected");
    } catch (error) {
        console.error("Error rejecting service provider request:", error);
        res.status(500).json("fail");
    }
});

app.post('/api/notifications', async (req, res) => {
    try {
        const { message } = req.body;
        const notification = new Notification({ message });
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Endpoint to fetch service providers based on their profession
app.get('/api/service-providers/:profession', async (req, res) => {
    const { profession } = req.params;

    try {
        const serviceProviders = await ServiceProvider.find({ profession: profession, approved: true });
        res.json(serviceProviders);
    } catch (error) {
        console.error(`Error fetching ${profession} service providers:`, error);
        res.status(500).json("fail");
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Assuming you have a Notification model in your database
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//for fetching users to admin
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the User collection
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
//for dlting users from admin
app.delete('/users/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      await User.deleteOne({ email });
      res.json({ message: 'Resident deleted successfully' });
    } catch (error) {
      console.error('Error deleting resident:', error);
      res.status(500).json({ error: 'Failed to delete resident' });
    }
  });
  //for fething service providers
  app.get('/ServiceProvider', async (req, res) => {
    try {
      const serviceProviders = await ServiceProvider.find({});
      res.json(serviceProviders);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      res.status(500).json({ error: 'Failed to fetch service providers' });
    }
  });
  app.delete('/ServiceProvider/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      await ServiceProvider.deleteOne({ email });
      res.json({ message: 'Service provider deleted successfully' });
    } catch (error) {
      console.error('Error deleting service provider:', error);
      res.status(500).json({ error: 'Failed to delete service provider' });
    }
  });
  
// Backend route to fetch users excluding the logged-in user
app.get('/users', async (req, res) => {
    const loggedInUserId = req.query.userId; // Assuming the logged-in user's ID is passed as a query parameter
    console.log('Logged in user ID:', loggedInUserId); 
    try {
      const users = await User.find({ _id: { $ne: loggedInUserId } });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
app.listen(port, () => {
    console.log(`Server connected on port ${port}`);
});
