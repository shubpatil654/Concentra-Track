const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function createDemoUser() {
    const DATA_DIR = path.join(__dirname, 'data');
    const USERS_FILE = path.join(DATA_DIR, 'users.json');
    
    // Ensure data directory exists
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    // Load existing users
    let users = [];
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        users = JSON.parse(data);
    } catch {
        // File doesn't exist, start with empty array
    }
    
    // Check if demo user already exists
    const demoEmail = 'demo@concentratrack.com';
    if (users.find(u => u.email === demoEmail)) {
        console.log('Demo user already exists!');
        console.log('Email: demo@concentratrack.com');
        console.log('Password: demo123');
        return;
    }
    
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const demoUser = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: 'Demo User',
        email: demoEmail,
        password: hashedPassword,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
    };
    
    users.push(demoUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    
    console.log('Demo user created successfully!');
    console.log('Email: demo@concentratrack.com');
    console.log('Password: demo123');
    console.log('You can now login with these credentials.');
}

createDemoUser().catch(console.error);