import { test, expect } from '@playwright/test'

test.describe('saucedemo login tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('https://www.saucedemo.com')
  })

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Swag Labs/)
  })

  test('standard user login', async ({ page }) => {
    await page.locator('#user-name').fill('standard_user')
    await page.locator('#password').fill('secret_sauce')
    await page.locator('#login-button').click()
    await expect(page.locator('#add-to-cart-sauce-labs-backpack')).toBeVisible()
  })

  test('locked out user login', async ({ page }) => {
    await page.locator('#user-name').fill('locked_out_user')
    await page.locator('#password').fill('secret_sauce')
    await page.locator('#login-button').click()
    await expect(page.locator('[data-test="error"]')).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    )
  })

  test('problem user login', async ({ page }) => {
    await page.locator('#user-name').fill('problem_user')
    await page.locator('#password').fill('secret_sauce')
    await page.locator('#login-button').click()
    await expect(page.getByAltText('Sauce Labs Backpack')).toHaveAttribute(
      'src',
      '/static/media/sl-404.168b1cce.jpg'
    )
  })

  test('performance glitch user login', async ({ page }) => {
    page.setDefaultTimeout(3000)
    await page.locator('#user-name').fill('performance_glitch_user')
    await page.locator('#password').fill('secret_sauce')
    try {
      await page.locator('#login-button').click()
    } catch (error) {
      expect(error).toBeTruthy()
    }
  })
})
