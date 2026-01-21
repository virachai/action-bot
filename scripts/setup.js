import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Setup script for Auto-Short-Factory
 * Handles dependency installation, environment setup, and database initialization
 */

function setup() {
    console.log('🚀 Starting Auto-Short-Factory Setup...\n');

    try {
        // 1. Check for pnpm
        console.log('📦 Checking for pnpm...');
        execSync('pnpm --version', { stdio: 'ignore' });
        console.log('✅ pnpm is installed.\n');

        // 2. Install dependencies
        console.log('📥 Installing dependencies...');
        execSync('pnpm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed.\n');

        // 3. Setup environment files
        console.log('📝 Setting up environment files...');
        if (!fs.existsSync('.env.local')) {
            fs.copyFileSync('.env.example', '.env.local');
            console.log('✅ Created .env.local from .env.example');
        } else {
            console.log('ℹ️ .env.local already exists.');
        }
        console.log('');

        // 4. Initialize Database (Generate Prisma Client)
        console.log('🗄️ Initializing database...');
        execSync('pnpm run db:generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated.\n');

        console.log('✨ Setup complete!');
        console.log('--------------------------------------------------');
        console.log('Next steps:');
        console.log('1. Edit .env.local with your API keys and DB URL');
        console.log('2. Run "pnpm run db:push" to sync your database schema');
        console.log('3. Run "pnpm run dev" to start the factory');
        console.log('--------------------------------------------------\n');

    } catch (error) {
        console.error('\n❌ Setup failed:');
        console.error(error.message);
        process.exit(1);
    }
}

setup();
