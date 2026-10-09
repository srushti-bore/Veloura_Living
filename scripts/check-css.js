async function check() {
  const html = await fetch('http://localhost:3000').then(r => r.text());
  const matches = [...html.matchAll(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g)];
  for (const m of matches) {
    const css = await fetch('http://localhost:3000' + m[1]).then(r => r.text());
    console.log('CSS file:', m[1], 'Length:', css.length);
    console.log('Includes 150e0a/150E0A:', css.toLowerCase().includes('150e0a'));
    console.log('Includes 1c140e/1C140E:', css.toLowerCase().includes('1c140e'));
    console.log('Includes hidden:', css.includes('.hidden') || css.includes('hidden{'));
    console.log('Includes sm:inline:', css.includes('sm\\:inline') || css.includes('sm:inline'));
    console.log('Includes text-[#FAF7F2]:', css.toLowerCase().includes('faf7f2'));
  }
}
check().catch(console.error);
