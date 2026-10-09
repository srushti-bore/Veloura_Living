async function inspectCSS() {
  const html = await fetch('http://localhost:3000').then(r => r.text());
  const matches = [...html.matchAll(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g)];
  for (const m of matches) {
    const css = await fetch('http://localhost:3000' + m[1]).then(r => r.text());
    
    // Find rules for bg-[#150E0A] and bg-[#1C140E]/90
    console.log('Searching in CSS for header classes...');
    const bg1 = css.match(/[^{}]*150[eE]0[aA][^{}]*\{[^}]*\}/g);
    console.log('Matches for 150E0A:', bg1);
    const bg2 = css.match(/[^{}]*1[cC]140[eE][^{}]*\{[^}]*\}/g);
    console.log('Matches for 1C140E:', bg2);
  }
}
inspectCSS().catch(console.error);
