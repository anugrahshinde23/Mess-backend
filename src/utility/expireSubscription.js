import Subscription from "../models/subscription.model.js";

export const expireSubscriptionsIfNeeded = async () => {
  const today = new Date();

  await Subscription.updateMany(
    {
      status: "ACTIVE",
      endDate: { $lt: today }
    },
    {
      $set: { status: "EXPIRED" }
    }
  );
};
