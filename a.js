const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// === ベースパス ===
const bp = "behavior_packs/sniper_bp";
const rp = "resource_packs/sniper_rp";

// === パス ===
const paths = {
  bp_items: path.join(bp, "items"),
  rp_models: path.join(rp, "models/item"),
  rp_textures: path.join(rp, "textures/item"),
  rp_sounds: path.join(rp, "sounds"),
  rp_lang: path.join(rp, "texts")
};

// === ディレクトリ作成 ===
Object.values(paths).forEach(ensureDir);

// === behavior_packs/items/sniper_rifle.json ===
fs.writeFileSync(path.join(paths.bp_items, "sniper_rifle.json"), JSON.stringify({
  "format_version": "1.20.0",
  "minecraft:item": {
    "description": {
      "identifier": "custom:sniper_rifle",
      "category": "equipment"
    },
    "components": {
      "minecraft:icon": "sniper_rifle",
      "minecraft:display_name": { "value": "§lスナイパーライフル" },
      "minecraft:use_duration": 100,
      "minecraft:cooldown": {
        "category": "weapon",
        "duration": 100
      },
      "minecraft:damage": { "value": 1 },
      "minecraft:durability": 350,
      "minecraft:shoot": {
        "projectile": "minecraft:arrow",
        "launch_power": 3,
        "sound": "custom:sniper_fire",
        "consume_projectile": true
      }
    }
  }
}, null, 2));

// === resource_packs/models/item/sniper_rifle.json ===
fs.writeFileSync(path.join(paths.rp_models, "sniper_rifle.json"), JSON.stringify({
  "parent": "builtin/generated",
  "textures": { "layer0": "textures/item/sniper_rifle" },
  "elements": [
    { "from": [2, 4, 0], "to": [14, 6, 2], "faces": { "north": { "texture": "#layer0" } } }, // 銃身
    { "from": [1, 4.5, 0], "to": [2, 5, 1], "faces": { "north": { "texture": "#layer0" } } }, // トリガー
    { "from": [10, 6, 1], "to": [13, 7, 2], "faces": { "north": { "texture": "#layer0" } } }  // スコープ
  ]
}, null, 2));

// === resource_packs/sounds.json ===
fs.writeFileSync(path.join(rp, "sounds.json"), JSON.stringify({
  "custom:sniper_fire": {
    "category": "player",
    "sounds": [{ "name": "sounds/sniper_fire", "volume": 1.0, "pitch": 1.0 }]
  }
}, null, 2));

// === resource_packs/textures/item/sniper_rifle.png ===
fs.writeFileSync(path.join(paths.rp_textures, "sniper_rifle.png"), Buffer.alloc(256)); // ダミー

// === resource_packs/texts/en_US.lang / ja_JP.lang ===
fs.writeFileSync(path.join(paths.rp_lang, "en_US.lang"), `item.custom.sniper_rifle.name=Sniper Rifle\n`);
fs.writeFileSync(path.join(paths.rp_lang, "ja_JP.lang"), `item.custom.sniper_rifle.name=スナイパーライフル\n`);

// === OGG: 金属音（sox synth） ===
const oggPath = path.join(paths.rp_sounds, "sniper_fire.ogg");
const result = spawnSync("sox", [
  "-n", oggPath,
  "synth", "0.2", "pluck", "C4", "reverb"
], { stdio: "inherit" });

if (result.error) {
  console.error("⚠ sox による音声生成に失敗しました。sox をインストールしてください。");
} else {
  console.log("✅ スナイパーライフルのアドオンが生成されました。");
}
