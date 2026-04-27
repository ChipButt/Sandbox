import { APP_CONFIG } from "./config.js";

export function getStage(level) {
  return APP_CONFIG.swordStages.find(stage => stage.level === level) || APP_CONFIG.swordStages[0];
}

export function getNextStage(level) {
  return APP_CONFIG.swordStages.find(stage => stage.level === level + 1) || null;
}

export function getStand(scanId) {
  return APP_CONFIG.stands.find(stand => stand.id === scanId) || null;
}

export function getReward(rewardId) {
  return APP_CONFIG.rewards.find(reward => reward.id === rewardId) || null;
}

export function canClaimReward(state, rewardId) {
  const reward = getReward(rewardId);
  if (!reward) return false;
  if (state.claimed) return false;
  return state.level >= reward.requiredLevel;
}

export function getRewardStatus(state, reward) {
  if (state.claimed && state.claimTier === reward.id) return "claimed";
  if (state.claimed) return "unavailable";
  if (state.level >= reward.requiredLevel) return "unlocked";
  return "locked";
}
