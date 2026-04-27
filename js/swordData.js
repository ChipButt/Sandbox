import { APP_CONFIG } from "./config.js";

export function getStage(level) {
  return APP_CONFIG.swordStages.find(stage => stage.level === level) || APP_CONFIG.swordStages[0];
}

export function getNextStage(level) {
  return APP_CONFIG.swordStages.find(stage => stage.level === level + 1) || null;
}

export function getRuneLocation(runeId) {
  return APP_CONFIG.runeLocations.find(location => location.id === runeId) || null;
}

export function getReward(rewardId) {
  return APP_CONFIG.rewards.find(reward => reward.id === rewardId) || null;
}

export function canClaimReward(state, rewardId) {
  const reward = getReward(rewardId);
  if (!reward || state.claimed) return false;
  return state.level >= reward.requiredLevel;
}

export function getBestUnlockedReward(state) {
  if (state.claimed) return null;
  if (state.level >= 6) return getReward("godlike");
  if (state.level >= 5) return getReward("legendary");
  return null;
}
