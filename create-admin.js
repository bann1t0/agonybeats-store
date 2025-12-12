// Create admin account
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const email = 'admin@agonybeats.com';
        const password = 'admin123'; // Change this!
        const name = 'Admin';

        // Check if admin exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('Admin already exists with email:', email);

            // Update to admin role if not already
            if (existing.role !== 'admin') {
                await prisma.user.update({
                    where: { email },
                    data: { role: 'admin' }
                });
                console.log('✅ Updated user to admin role');
            }
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create admin
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'admin'
                }
            });

            console.log('✅ Admin account created!');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
