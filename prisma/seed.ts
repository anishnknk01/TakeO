/**
 * Minimal seed file for deployment
 * The original seed is backed up as seed.ts.backup
 */

console.log('Seed file executed during build - no operations performed');

async function main() {
  console.log('✅ Seed placeholder completed');
}

// Only run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}