import { test, expect } from '@playwright/test';

test('Input en parcelas permanece visible al escribir', async ({ page }) => {
  // Navegar directamente al formulario de inspecciones (asumiendo autenticación)
  await page.goto('http://localhost:5174/admin/inspectionsform');

  // Esperar a que la página cargue
  await page.waitForLoadState('networkidle');

  // Seleccionar dependencia "Zona Marítima"
  const maritimeZoneOption = page.locator('select[name="dependency"]').locator('option[value="MaritimeZone"]');
  await maritimeZoneOption.click();

  // Avanzar al siguiente paso para mostrar la sección de ZMT
  const nextButton = page.locator('button', { hasText: 'Siguiente' });
  await nextButton.click();

  // Esperar a que aparezca la sección de ZMT
  await page.waitForSelector('text=Información de la Concesión ZMT');

  // Avanzar al paso 3 donde están las parcelas
  await nextButton.click();

  // Esperar a que aparezca la sección de parcelas
  await page.waitForSelector('text=Información de Parcelas');

  // Localizar el input de "Tipo de plano" en parcelas
  const input = page.locator('#planType');

  // Asegurar que el input está visible inicialmente
  await expect(input).toBeVisible();

  // Escribir "a" en el input
  await input.fill('a');

  // Verificar que el input sigue visible
  await expect(input).toBeVisible();

  // Verificar que tiene el valor correcto
  await expect(input).toHaveValue('a');

  // Verificar que mantiene el foco
  await expect(input).toBeFocused();
});
