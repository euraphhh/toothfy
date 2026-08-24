const app = require('./app');
const jobScheduler = require('./workers/jobScheduler');

const PORT = process.env.PORT || 3000;

jobScheduler.start();

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
