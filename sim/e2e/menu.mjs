// Menu bar helper for the browser checks: open `top`, then run the item labelled exactly `item`.
export async function menu(page, top, item) {
  await page.getByRole('menuitem', {name: top, exact: true}).click();
  const label = new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  await page.getByRole('menu', {name: top}).locator('[role^="menuitem"]').filter({has: page.locator('.menu-label', {hasText: label})}).click();
}

/** The aria-checked state of a checkbox or radio item; the menu is closed again after. */
export async function menuChecked(page, top, item) {
  await page.getByRole('menuitem', {name: top, exact: true}).click();
  const label = new RegExp(`^${item}$`);
  const checked = await page.getByRole('menu', {name: top}).locator('[aria-checked]').filter({has: page.locator('.menu-label', {hasText: label})}).getAttribute('aria-checked');
  await page.getByRole('menuitem', {name: top, exact: true}).click();
  return checked === 'true';
}
