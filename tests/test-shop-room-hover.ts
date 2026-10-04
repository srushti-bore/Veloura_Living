import { SHOP_ROOM_HOVER_DATA } from '../lib/data/shopRoomHoverData';

console.log('🧪 Verifying Shop Room Hover (Reference-Matched) Data Integrity...\n');

const rooms = ['all', 'living-room', 'bedroom', 'dining', 'office'];

let totalItems = 0;
let totalHeroes = 0;

for (const key of rooms) {
  const room = SHOP_ROOM_HOVER_DATA[key];
  if (!room) {
    console.error(`❌ Missing room data for: ${key}`);
    process.exit(1);
  }

  console.log(`✅ [Room: ${room.label}]`);
  console.log(`   Eyebrow: "${room.eyebrow}"`);
  console.log(`   Headline: "${room.headline}"`);
  console.log(`   Primary CTA: "${room.primaryCtaText}"`);
  console.log(`   Disciplines/Items: ${room.items.length}`);

  totalItems += room.items.length;

  for (const item of room.items) {
    console.log(`     🔹 ${item.name} (${item.subtitle || 'no subtitle'}) [icon: ${item.iconName || 'default'}]`);
    if (!item.name) {
      console.error(`❌ Item in room ${room.label} missing name!`);
      process.exit(1);
    }
  }

  console.log(`   Featured Hero: "${room.featuredHero.title}" -> ${room.featuredHero.image}`);
  totalHeroes++;
  if (!room.featuredHero.image.startsWith('/images/')) {
    console.error(`❌ Hero image ${room.featuredHero.image} has invalid path!`);
    process.exit(1);
  }
  console.log('');
}

console.log('==============================================');
console.log(`🎉 ALL ROOM HOVER DATA VALIDATED SUCCESSFULLY!`);
console.log(`   Total Rooms: ${rooms.length}`);
console.log(`   Total Categorized Disciplines: ${totalItems}`);
console.log(`   Total Featured Hero Lifestyle Cards: ${totalHeroes}`);
console.log('==============================================');
