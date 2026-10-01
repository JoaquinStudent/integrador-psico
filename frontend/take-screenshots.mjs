import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CAPTURAS_DIR = '/Users/jonatl9/Desktop/integrador-psico/capturas';

if (!fs.existsSync(CAPTURAS_DIR)) {
  fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando captura de vistas con Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login Page
  console.log('Capturando 01-login.png...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.waitForSelector('form.login-form', { timeout: 10000 });
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '01-login.png') });

  // Iniciar sesión
  console.log('Iniciando sesión con joaquinchaparro1403@gmail.com...');
  await page.type('input[type="email"]', 'joaquinchaparro1403@gmail.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Esperar a que cargue el dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Dashboard
  console.log('Capturando 02-dashboard.png...');
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '02-dashboard.png') });

  // 3. Pacientes listado
  console.log('Capturando 03-pacientes-listado.png...');
  await page.goto('http://localhost:5173/pacientes', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '03-pacientes-listado.png') });

  // 4. Paciente detalle
  console.log('Capturando 04-paciente-detalle.png...');
  await page.goto('http://localhost:5173/pacientes/ac5938a9-12ce-4854-b827-c3c6ac8274c0', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '04-paciente-detalle.png') });

  // 5. Catálogo de tests
  console.log('Capturando 05-catalogo-tests.png...');
  await page.goto('http://localhost:5173/tests', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '05-catalogo-tests.png') });

  // 6. Sesiones listado
  console.log('Capturando 06-sesiones-listado.png...');
  await page.goto('http://localhost:5173/sesiones', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '06-sesiones-listado.png') });

  // 7. Nueva sesión wizard
  console.log('Capturando 07-nueva-sesion-wizard.png...');
  await page.goto('http://localhost:5173/sesiones/nueva', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '07-nueva-sesion-wizard.png') });

  // 8. Paciente bienvenida (Vista Tablet)
  console.log('Capturando 08-paciente-bienvenida.png (Tablet)...');
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3/paciente/bienvenida', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '08-paciente-bienvenida.png') });

  // 9. Paciente lienzo dibujo (Vista Tablet)
  console.log('Capturando 09-paciente-lienzo-dibujo.png (Tablet)...');
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3/paciente/dibujo', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '09-paciente-lienzo-dibujo.png') });

  // 10. Paciente cierre (Vista Tablet)
  console.log('Capturando 10-paciente-cierre.png (Tablet)...');
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3/paciente/cierre', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '10-paciente-cierre.png') });

  // Regresar a vista Desktop
  await page.setViewport({ width: 1440, height: 900 });

  // 11. Examinador sesión en vivo
  console.log('Capturando 11-examinador-sesion-en-vivo.png...');
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '11-examinador-sesion-en-vivo.png') });

  // 12. Análisis objetivo y métricas PBLL
  console.log('Capturando 12-analisis-metricas-pbll.png...');
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3/analisis', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '12-analisis-metricas-pbll.png') });

  // 13. Verificación de indicadores (Checklist por secciones)
  console.log('Capturando 13-verificacion-indicadores-checklist.png...');
  await page.goto('http://localhost:5173/sesion/2b6d28bd-3531-48e3-b9f2-41d6ef9c2ec3/observaciones', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '13-verificacion-indicadores-checklist.png') });

  // 14. Informes listado
  console.log('Capturando 14-informes-listado.png...');
  await page.goto('http://localhost:5173/informes', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '14-informes-listado.png') });

  // 15. Editor de informe clínico (9 secciones)
  console.log('Capturando 15-editor-informe-clinico.png...');
  await page.goto('http://localhost:5173/informes/59ecc4cd-f375-4c6d-a7dd-feb0615b877d', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '15-editor-informe-clinico.png') });

  // 16. Tablet atajo sesión activa
  console.log('Capturando 16-tablet-atajo-sesion-activa.png...');
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:5173/sesion/activa', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '16-tablet-atajo-sesion-activa.png') });

  await browser.close();
  console.log('¡Todas las capturas se generaron exitosamente en:', CAPTURAS_DIR);
}

run().catch(err => {
  console.error('Error en captura:', err);
  process.exit(1);
});
