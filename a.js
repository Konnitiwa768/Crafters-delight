const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { createCanvas } = require("canvas");

// === ユーティリティ ===
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function delDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// === 前のsniper_rp, sniper_bp 削除 ===
delDir("sniper_rp");
delDir("sniper_bp");

// === 旧テクスチャコピー ===
const oldTex = "sniper_rp/textures/item/sniper_rifle.png";
const newTex = "Crafters_delight_rp/textures/item/sniper_rifle.png";
if (fs.existsSync(oldTex)) {
  ensureDir(path.dirname(newTex));
  fs.copyFileSync(oldTex, newTex);
}

// === パス定義 ===
const bp = "Crafters_delight_bp";
const rp = "Crafters_delight_rp";
const paths = {
  bp_items: path.join(bp, "items"),
  rp_models: path.join(rp, "models/item"),
  rp_textures: path.join(rp, "textures/item"),
  rp_ui: path.join(rp, "textures/ui"),
  rp_sounds: path.join(rp, "sounds"),
  rp_lang: path.join(rp, "texts"),
};

// === ディレクトリ生成 ===
Object.values(paths).forEach(ensureDir);

// === sniper_rifle.json（BP）===
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
      },
      "minecraft:camera": {
        "zoom": true,
        "type": "tag:sniper_zoom"
      }
    }
  }
}, null, 2));

// === models/item/sniper_rifle.json（RP）===
fs.writeFileSync(path.join(paths.rp_models, "sniper_rifle.json"), JSON.stringify({
  "parent": "builtin/generated",
  "textures": { "layer0": "textures/item/sniper_rifle" },
  "elements": [
    { "from": [2, 4, 0], "to": [14, 6, 2], "faces": { "north": { "texture": "#layer0" } } },
    { "from": [1, 4, 0], "to": [2, 5, 1], "faces": { "north": { "texture": "#layer0" } } },
    { "from": [4, 6, 1], "to": [13, 7, 2], "faces": { "north": { "texture": "#layer0" } } }
  ]
}, null, 2));

// === lang（両言語）===
fs.writeFileSync(path.join(paths.rp_lang, "en_US.lang"), `item.custom.sniper_rifle.name=Sniper Rifle\n`);
fs.writeFileSync(path.join(paths.rp_lang, "ja_JP.lang"), `item.custom.sniper_rifle.name=スナイパーライフル\n`);

// === sounds.json ===
fs.writeFileSync(path.join(rp, "sounds.json"), JSON.stringify({
  "custom:sniper_fire": {
    "category": "player",
    "sounds": [{ "name": "sounds/sniper_fire", "volume": 1.0, "pitch": 1.0 }]
  }
}, null, 2));

// === OGG音生成（sox使用）===
const oggPath = path.join(paths.rp_sounds, "sniper_fire.ogg");
const result = spawnSync("sox", [
  "-n", oggPath,
  "synth", "0.2", "pluck", "C4", "reverb"
], { stdio: "inherit" });

if (result.error) {
  console.error("⚠ sox が見つかりません。`sox` コマンドが必要です。");
}

// === スコープ画像自動生成（canvas使用）===
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, 256, 256);

// 中央を丸くくりぬく
ctx.globalCompositeOperation = "destination-out";
ctx.beginPath();
ctx.arc(128, 128, 100, 0, Math.PI * 2);
ctx.fill();

// 枠線（スコープ線）
ctx.globalCompositeOperation = "source-over";
ctx.strokeStyle = "gray";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(0, 128); ctx.lineTo(256, 128);
ctx.moveTo(128, 0); ctx.lineTo(128, 256);
ctx.stroke();

// 保存
const out = fs.createWriteStream(path.join(paths.rp_ui, "scope_overlay.png"));
const stream = canvas.createPNGStream();
stream.pipe(out);

out.on("finish", () => {
  console.log("✅ スコープ画像も生成済み");
});
