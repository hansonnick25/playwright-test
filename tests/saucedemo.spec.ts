import { test, expect } from '@playwright/test'

test.describe('saucedemo tests', () => {
  test('saucedemo login tests', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the starting url before each test.
      await page.goto('https://www.saucedemo.com')
    })

    test('has title', async ({ page }) => {
      await expect(page).toHaveTitle(/Swag Labs/)
    })g

    test('standard user login', async ({ page }) => {
      await page.locator('#user-name').fill('standard_user')
      await page.locator('#password').fill('secret_sauce')
      await page.locator('#login-button').click()
      await expect(
        page.locator('#add-to-cart-sauce-labs-backpack')
      ).toBeVisible()
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

  test.describe('saucedemo cart tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://www.saucedemo.com')
      await page.locator('#user-name').fill('standard_user')
      await page.locator('#password').fill('secret_sauce')
      await page.locator('#login-button').click()
      await expect(
        page.locator('#add-to-cart-sauce-labs-backpack')
      ).toBeVisible()
    })

    test('add a backpack to cart', async ({ page }) => {
      await page.locator('#add-to-cart-sauce-labs-backpack').click()
      await page.locator('.shopping_cart_link').click()
      await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1')
    })

    test('add backpack and remove it from cart', async ({ page }) => {
      await page.locator('#add-to-cart-sauce-labs-backpack').click()
      await page.locator('.shopping_cart_link').click()
      await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1')
      await page.locator('[data-test="remove-sauce-labs-backpack"]').click()
      await expect(page.locator('.removed_cart_item')).toBeDefined()
    })

    test('checkout happy path', async ({ page }) => {
      await page.locator('#add-to-cart-sauce-labs-backpack').click()
      await page.locator('.shopping_cart_link').click()
      await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1')
      await page.locator('#checkout').click()
      await expect(page.locator('[data-test="title"]')).toContainText(
        'Checkout: Your Information'
      )
      await page.locator('#first-name').fill('Vanilla')
      await page.locator('#last-name').fill('Ice')
      await page.locator('#postal-code').fill('90210')
      await page.locator('#continue').click()
      await expect(page.locator('[data-test="title"]')).toContainText(
        'Checkout: Overview'
      )
      await page.locator('#finish').click()
      await expect(page.locator('.complete-header')).toContainText(
        'Thank you for your order!'
      )
      await page.locator('#back-to-products').click()
      await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html')
    })
  })
})
