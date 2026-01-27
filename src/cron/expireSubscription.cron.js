import cron from 'node-cron'
import { expireSubscriptionsIfNeeded } from '../utility/expireSubscription.js'

cron.schedule("*/1 * * * *", async () => {
    console.log("⏰ Cron running: Checking expired subscriptions...");
    await expireSubscriptionsIfNeeded();
  });