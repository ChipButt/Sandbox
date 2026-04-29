export const firebaseConfig = {
  apiKey: "",
  authDomain: "forgequest-c89d8.firebaseapp.com",
  projectId: "forgequest-c89d8",
  storageBucket: "forgequest-c89d8.firebasestorage.app",
  messagingSenderId: "348450171684",
  appId: "1:348450171684:web:f23e64bd1a8db84deee1b1",
  measurementId: "G-9XR4FBDGQB"
};

export const APP_CONFIG = {
  appName: "Roll Britannia Forge Quest",
  localSaveKey: "roll_britannia_forge_quest_player_v1",
  maxLevel: 6,
  firebaseCollections: {
    players: "forgeQuestPlayers",
    prizeDraw: "forgeQuestPrizeDraw"
  },
  stands: [
    { id: "roll-britannia", name: "Roll Britannia", label: "Quest Stand" },
    { id: "stand-1", name: "Stand 1", label: "Quest Stand" },
    { id: "stand-2", name: "Stand 2", label: "Quest Stand" },
    { id: "stand-3", name: "Stand 3", label: "Quest Stand" },
    { id: "stand-4", name: "Stand 4", label: "Quest Stand" },
    { id: "stand-5", name: "Stand 5", label: "Quest Stand" }
  ],
  swordStages: [
    {
      level: 0,
      rarity: "No Sword",
      name: "No Sword Forged Yet",
      colour: "#c8bba5",
      description: "Scan any quest stand QR code to begin your forge quest.",
      blade: "#777777",
      hilt: "#5e4b33",
      gem: "#999999"
    },
    {
      level: 1,
      rarity: "Common",
      name: "Common Iron Sword",
      colour: "#c9c0ad",
      description: "A plain iron blade. Reliable, practical, and the start of something better.",
      blade: "#b9b6ad",
      hilt: "#6e5030",
      gem: "#9b8b72"
    },
    {
      level: 2,
      rarity: "Uncommon",
      name: "Uncommon Verdant Blade",
      colour: "#63d47a",
      description: "The edge carries a faint green shimmer. Something has started to wake within the steel.",
      blade: "#76db8a",
      hilt: "#345c35",
      gem: "#63d47a"
    },
    {
      level: 3,
      rarity: "Rare",
      name: "Rare Azure Spellblade",
      colour: "#4aa3ff",
      description: "A bright blue enchantment runs through the blade. Powerful, but not yet exchange-ready.",
      blade: "#72b8ff",
      hilt: "#294b75",
      gem: "#4aa3ff"
    },
    {
      level: 4,
      rarity: "Very Rare",
      name: "Very Rare Arcane Greatsword",
      colour: "#b16dff",
      description: "The blade hums with arcane pressure. One more unique quest scan will unlock the first reward tier.",
      blade: "#c08aff",
      hilt: "#56317a",
      gem: "#b16dff"
    },
    {
      level: 5,
      rarity: "Legendary",
      name: "Legendary Dragonforged Sword",
      colour: "#f2a93b",
      description: "A weapon of songs, tavern rumours, and deeply irresponsible power. Eligible for an immediate gift.",
      blade: "#ffc45c",
      hilt: "#7b421f",
      gem: "#f2a93b"
    },
    {
      level: 6,
      rarity: "Godlike",
      name: "Godlike Sword of Britannia",
      colour: "#ffeb8a",
      description: "The final form. Ridiculous, radiant, and showing off. Eligible for an immediate gift and prize draw entry.",
      blade: "#fff0a8",
      hilt: "#aa7a22",
      gem: "#fff7c2"
    }
  ],
  rewards: [
    {
      id: "legendary",
      requiredLevel: 5,
      tierName: "Legendary Reward",
      title: "Legendary Gift",
      lockedText: "Reach Legendary, then ask staff for the Legendary claim QR code.",
      successText: "Congratulations — your Legendary sword has been exchanged. Enjoy your reward."
    },
    {
      id: "godlike",
      requiredLevel: 6,
      tierName: "Godlike Reward",
      title: "Godlike Gift + Prize Draw",
      lockedText: "Reach Godlike, then ask staff for the Godlike claim QR code.",
      successText: "Congratulations — your Godlike sword has been exchanged. Enjoy your reward now, and good luck in the grand prize draw."
    }
  ],
  claimCodes: {
    legendary: "rbf-legendary-claim",
    godlike: "rbf-godlike-claim"
  },
  prizeDrawConsentText: "I agree to be contacted by Roll Britannia if I win the prize draw."
};
