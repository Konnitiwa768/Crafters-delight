const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function delDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// === 前のsniper系削除 ===
delDir("sniper_rp");
delDir("sniper_bp");

// === texture移動 ===
const oldTex = "sniper_rp/textures/item/sniper_rifle.png";
const newTex = "Crafters_delight_rp/textures/item/sniper_rifle.png";
if (fs.existsSync(oldTex)) {
  ensureDir(path.dirname(newTex));
  fs.copyFileSync(oldTex, newTex);
}

// === 新パス定義 ===
const bp = "Crafters_delight_bp";
const rp = "Crafters_delight_rp";

const paths = {
  bp_items: path.join(bp, "items"),
  rp_models: path.join(rp, "models/item"),
  rp_textures: path.join(rp, "textures/item"),
  rp_sounds: path.join(rp, "sounds"),
  rp_lang: path.join(rp, "texts"),
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
      "minecraft:enchantable": {
        "slot": "bow",
        "value" 1,
      }
    }
  }
}, null, 2));

// === models/item/sniper_rifle.json ===
fs.writeFileSync(path.join(paths.rp_models, "sniper_rifle.json"), JSON.stringify({
  "parent": "builtin/generated",
  "textures": { "layer0": "textures/item/sniper_rifle" },
  "elements": [
    { "from": [2, 4, 0], "to": [14, 6, 2], "faces": { "north": { "texture": "#layer0" } } },
    { "from": [1, 4, 0], "to": [2, 5, 1], "faces": { "north": { "texture": "#layer0" } } },
    { "from": [4, 6, 1], "to": [13, 8, 2], "faces": { "north": { "texture": "#layer0" } } }
  ]
}, null, 2));

// === sounds.json ===
fs.writeFileSync(path.join(rp, "sounds.json"), JSON.stringify({
  "custom:sniper_fire": {
    "category": "player",
    "sounds": [{ "name": "sounds/sniper_fire", "volume": 1.0, "pitch": 1.0 }]
  }
}, null, 2));

// === lang ===
fs.writeFileSync(path.join(paths.rp_lang, "en_US.lang"), `item.custom.sniper_rifle.name=Sniper Rifle\n`);
fs.writeFileSync(path.join(paths.rp_lang, "ja_JP.lang"), `item.custom.sniper_rifle.name=スナイパーライフル\n`);

// === OGG生成 ===
const oggPath = path.join(paths.rp_sounds, "sniper_fire.ogg");
const result = spawnSync("sox", [
  "-n", oggPath,
  "synth", "0.2", "pluck", "C4", "reverb"
], { stdio: "inherit" });

if (result.error) {
  console.error("⚠ sox による音声生成に失敗しました。sox をインストールしてください。");
} else {
  console.log("✅ Crafters_delight のスナイパーライフル生成が完了しました。");
}
