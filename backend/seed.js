const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Employee = require('./models/Employee');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Product.deleteMany(),
      Sale.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@demoerp.com', password: 'Admin@123', role: 'admin' },
      { name: 'Manager User', email: 'manager@demoerp.com', password: 'Manager@123', role: 'manager' },
      { name: 'Employee User', email: 'employee@demoerp.com', password: 'Employee@123', role: 'employee' },
    ]);
    console.log('👤 Users created');

    const adminId = users[0]._id;

    // Create Employees
    const employees = await Employee.create([
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@company.com',
        phone: '+91-9876543210',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        salary: 95000,
        joiningDate: new Date('2021-03-15'),
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@company.com',
        phone: '+91-9876543211',
        department: 'Sales',
        designation: 'Sales Manager',
        salary: 75000,
        joiningDate: new Date('2020-07-01'),
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Anita Patel',
        email: 'anita.patel@company.com',
        phone: '+91-9876543212',
        department: 'HR',
        designation: 'HR Business Partner',
        salary: 65000,
        joiningDate: new Date('2022-01-10'),
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@company.com',
        phone: '+91-9876543213',
        department: 'Finance',
        designation: 'Financial Analyst',
        salary: 80000,
        joiningDate: new Date('2019-11-20'),
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Meera Nair',
        email: 'meera.nair@company.com',
        phone: '+91-9876543214',
        department: 'Marketing',
        designation: 'Digital Marketing Lead',
        salary: 70000,
        joiningDate: new Date('2021-08-05'),
        status: 'on-leave',
        createdBy: adminId,
      },
    ]);
    console.log('👥 Employees created');

    // Create Products
    const products = await Product.create([
      {
        name: 'Dell XPS 15 Laptop',
        sku: 'DELL-XPS-15',
        category: 'Electronics',
        stock: 45,
        price: 1299.99,
        supplier: 'Dell Technologies',
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Ergonomic Office Chair',
        sku: 'FURN-CHAIR-01',
        category: 'Furniture',
        stock: 8,
        price: 450.00,
        supplier: 'Herman Miller',
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Microsoft Office 365',
        sku: 'MS-OFF365-1Y',
        category: 'Software',
        stock: 100,
        price: 99.99,
        supplier: 'Microsoft',
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'Logitech MX Master Mouse',
        sku: 'LOGI-MX-MSTR',
        category: 'Electronics',
        stock: 5,
        price: 89.99,
        supplier: 'Logitech',
        status: 'active',
        createdBy: adminId,
      },
      {
        name: 'A4 Paper Ream (500 Sheets)',
        sku: 'PAPER-A4-500',
        category: 'Office Supplies',
        stock: 200,
        price: 8.99,
        supplier: 'Staples',
        status: 'active',
        createdBy: adminId,
      },
    ]);
    console.log('📦 Products created');

    // Create Sales
    await Sale.create([
      {
        customerName: 'TechCorp Solutions',
        product: products[0]._id,
        quantity: 5,
        totalAmount: 6499.95,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        createdBy: adminId,
      },
      {
        customerName: 'StartUp Hub Ltd',
        product: products[1]._id,
        quantity: 10,
        totalAmount: 4500.00,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        createdBy: adminId,
      },
      {
        customerName: 'Global Enterprises',
        product: products[2]._id,
        quantity: 25,
        totalAmount: 2499.75,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        createdBy: adminId,
      },
      {
        customerName: 'Digital Agency Co',
        product: products[3]._id,
        quantity: 15,
        totalAmount: 1349.85,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        createdBy: adminId,
      },
      {
        customerName: 'Office World Inc',
        product: products[4]._id,
        quantity: 50,
        totalAmount: 449.50,
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        createdBy: adminId,
      },
    ]);
    console.log('💰 Sales created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin:    admin@demoerp.com    / Admin@123');
    console.log('   Manager:  manager@demoerp.com  / Manager@123');
    console.log('   Employee: employee@demoerp.com / Employee@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
