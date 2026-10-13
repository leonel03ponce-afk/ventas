const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [out, from, to, step, lista] = process.argv.slice(2); const fps = 30;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8767/dark/stage.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const frames = lista ? lista.split(',').map(Number) : [];
  if (!lista) for (let i = +from; i < +to; i += (+step || 1)) frames.push(i);
  for (const i of frames) {
    await p.evaluate(t => window.render(t), i / fps);
    await p.screenshot({ path: `${out}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 90 });
  }
  console.log('listo', errs);
  await b.close();
})();
