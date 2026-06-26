const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' }); 

const User = require('../models/User');

const developers = [
  { id: 'developer_K0', pass: 'AdminK0' },
  { id: 'developer_K1', pass: 'AdminK1' },
  { id: 'developer_K2', pass: 'AdminK2' },
  { id: 'developer_K3', pass: 'AdminK3' },
  { id: 'developer_K4', pass: 'AdminK4' },
  { id: 'developer_K5', pass: 'AdminK5' },
  { id: 'developer_K6', pass: 'AdminK6' },
  { id: 'developer_K7', pass: 'AdminK7' },
  { id: 'developer_K8', pass: 'AdminK8' },
  { id: 'developer_K9', pass: 'AdminK9' },
  { id: 'developer_20', pass: 'Admin20' },
];

async function generate() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ccms');
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);

    for (let dev of developers) {
      const hashedPassword = await bcrypt.hash(dev.pass, salt);
      
      const adminData = {
        fullName: 'Developer ' + dev.id.split('_')[1],
        systemId: dev.id,
        email: dev.id + '@developer.local',
        phoneNumber: '0000000000',
        address: 'N/A',
        password: hashedPassword,
        role: 'admin',
        adminLevel: 'superadmin',
        isFirstLogin: true // Force them to set email on first login
      };

      await User.findOneAndUpdate(
        { systemId: dev.id },
        { $set: adminData },
        { upsert: true, new: true }
      );
      console.log(`Created/Updated ${dev.id}`);
    }

    console.log('All developer accounts generated.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

generate();
