// Quick script to check if DATABASE_URL is set
console.log('Checking environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');

if (process.env.DATABASE_URL) {
  // Mask the password for security
  const url = process.env.DATABASE_URL;
  const masked = url.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (masked):', masked);
} else {
  console.error('\n❌ ERROR: DATABASE_URL is not set!');
  console.error('Please set DATABASE_URL in Railway environment variables.');
  process.exit(1);
}
