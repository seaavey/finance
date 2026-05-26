export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    // Prevent stack trace leakage as identified in the pentest report
    if (error && typeof error === 'object') {
      if ('stack' in error) {
        error.stack = '';
      }

      // Also scrub sensitive details that might be leaked by default handlers
      if ('message' in error && typeof error.message === 'string') {
        if (error.message.includes('/Users/') || error.message.includes('/var/www/')) {
          error.message = 'Internal Server Error';
        }
      }
    }
  });
});
