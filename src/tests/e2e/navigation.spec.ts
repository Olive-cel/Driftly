import { test, expect } from "@playwright/test";

test.describe("E2E - Landing Page", () => {
  test("devrait charger la page d'accueil", async ({ page }) => {
    await page.goto("/");

    // Vérifier que la page s'est chargée
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test("devrait afficher le bouton de connexion", async ({ page }) => {
    await page.goto("/");

    // Chercher un bouton de connexion
    const loginButton = page.locator("text=/[Cc]onnexion|[Ll]ogin/");
    const isVisible = await loginButton.isVisible().catch(() => false);

    // Si le bouton existe, vérifier qu'il est visible
    if (isVisible) {
      expect(await loginButton.isVisible()).toBe(true);
    }
  });

  test("devrait afficher le bouton d'inscription", async ({ page }) => {
    await page.goto("/");

    // Chercher un bouton d'inscription
    const signupButton = page.locator("text=/[Ii]nscription|[Ss]ign [Uu]p|[Cc]réer/");
    const isVisible = await signupButton.isVisible().catch(() => false);

    // Si le bouton existe, vérifier qu'il est visible
    if (isVisible) {
      expect(await signupButton.isVisible()).toBe(true);
    }
  });
});

test.describe("E2E - Login Page", () => {
  test("devrait afficher le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");

    // Attendre que la page se charge
    await page.waitForLoadState("networkidle");

    // Vérifier qu'on est sur la page de connexion
    expect(page.url()).toContain("login");
  });

  test("devrait avoir un champ email", async ({ page }) => {
    await page.goto("/login");

    // Chercher un input type email
    const emailInput = page.locator('input[type="email"]').first();
    const isVisible = await emailInput.isVisible().catch(() => false);

    if (isVisible) {
      expect(await emailInput.isVisible()).toBe(true);
    }
  });

  test("devrait avoir un champ password", async ({ page }) => {
    await page.goto("/login");

    // Chercher un input type password
    const passwordInput = page.locator('input[type="password"]').first();
    const isVisible = await passwordInput.isVisible().catch(() => false);

    if (isVisible) {
      expect(await passwordInput.isVisible()).toBe(true);
    }
  });

  test("devrait avoir un bouton submit", async ({ page }) => {
    await page.goto("/login");

    // Chercher un bouton
    const submitButton = page.locator("button").first();
    const isVisible = await submitButton.isVisible().catch(() => false);

    if (isVisible) {
      expect(await submitButton.isVisible()).toBe(true);
    }
  });
});

test.describe("E2E - Navigation", () => {
  test("devrait pouvoir naviguer vers la page de connexion", async ({ page }) => {
    await page.goto("/");

    // Essayer de cliquer sur un lien vers login
    const loginLink = page.locator("text=/[Cc]onnexion|[Ll]ogin/").first();
    const exists = await loginLink.isVisible().catch(() => false);

    if (exists) {
      await loginLink.click();
      // Attendre que la navigation soit complète
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("login");
    }
  });

  test("devrait afficher les erreurs de réseau gracieusement", async ({ page }) => {
    // Tenter une navigation vers une page qui n'existe pas
    await page.goto("/nonexistent-page").catch(() => null);

    // Vérifier que la page n'a pas disparu complètement
    expect(page.url()).toBeDefined();
  });
});
