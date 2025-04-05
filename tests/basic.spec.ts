import { test, expect } from '@playwright/test'

const API_ENDPOINTS = {
  users: '/api/users',
  singleUser: (id: number) => `/api/users/${id}`,
  colors: '/api/unknown',
  singleColor: (id: number) => `/api/unknown/${id}`,
  register: '/api/register',
  login: '/api/login',
}

const TEST_OBJECTS = {
  newUser: { name: 'Mr. Andersen', job: 'Nobody' },
  updatedUser: { name: 'Neo', job: 'The One' },
  newLogin: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
  problemLogin: { email: 'eve.holt@reqres.in' },
  emails: { george: 'george.bluth@reqres.in', janet: 'janet.weaver@reqres.in' },
  errorMessage: 'Missing password',
}

// Helper functions
async function assertResponseOk(response, expectedStatus) {
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(expectedStatus)
}

async function assertResponseError(response, expectedStatus) {
  expect(response.ok()).toBeFalsy()
  expect(response.status()).toBe(expectedStatus)
}

async function assertSingleItem(item, expectedProperties) {
  for (const [key, value] of Object.entries(expectedProperties)) {
    expect(item[key]).toStrictEqual(value)
  }
}

async function assertMultipleItems(items, options) {
  const { minLength = 1, firstItemProperties = {} } = options
  expect(Array.isArray(items)).toBeTruthy()
  expect(items.length).toBeGreaterThanOrEqual(minLength)
  if (Object.keys(firstItemProperties).length > 0) {
    await assertSingleItem(items[0], firstItemProperties)
  }
}

async function parseJson(response) {
  try {
    return await response.json()
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`)
  }
}

// Test suite
test.describe('API Tests', () => {
  // User-related tests
  test.describe('User API', () => {
    test('get all users', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.users)
      await assertResponseOk(response, 200)
      const users = await parseJson(response)
      await assertMultipleItems(users.data, {
        firstItemProperties: { email: TEST_OBJECTS.emails.george },
      })
    })

    test('get single user', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.singleUser(2))
      await assertResponseOk(response, 200)
      const user = await parseJson(response)
      await assertSingleItem(user.data, { email: TEST_OBJECTS.emails.janet })
    })

    test('get single user - 404', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.singleUser(23))
      await assertResponseError(response, 404)
    })

    test('Create a new user', async ({ request }) => {
      const response = await request.post(API_ENDPOINTS.users, {
        data: TEST_OBJECTS.newUser,
      })
      await assertResponseOk(response, 201)
      const user = await parseJson(response)
      await assertSingleItem(user, {
        name: TEST_OBJECTS.newUser.name,
        job: TEST_OBJECTS.newUser.job,
      })
    })

    test('Update a user', async ({ request }) => {
      const response = await request.put(API_ENDPOINTS.singleUser(99), {
        data: TEST_OBJECTS.updatedUser,
      })
      await assertResponseOk(response, 200)
      const user = await parseJson(response)
      await assertSingleItem(user, {
        name: TEST_OBJECTS.updatedUser.name,
        job: TEST_OBJECTS.updatedUser.job,
      })
    })

    test('Delete a user', async ({ request }) => {
      const response = await request.delete(API_ENDPOINTS.singleUser(99))
      await assertResponseOk(response, 204)
    })
  })

  // Color-related tests
  test.describe('Color API', () => {
    test('get all colors', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.colors)
      await assertResponseOk(response, 200)
      const colors = await parseJson(response)
      await assertMultipleItems(colors.data, {
        firstItemProperties: { name: 'cerulean' },
      })
    })

    test('get single color', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.singleColor(2))
      await assertResponseOk(response, 200)
      const color = await parseJson(response)
      await assertSingleItem(color.data, { name: 'fuchsia rose' })
    })

    test('get single color - 404', async ({ request }) => {
      const response = await request.get(API_ENDPOINTS.singleColor(23))
      await assertResponseError(response, 404)
    })
  })

  // Authentication-related tests
  test.describe('Authentication API', () => {
    test('register successfully', async ({ request }) => {
      const response = await request.post(API_ENDPOINTS.register, {
        data: TEST_OBJECTS.newLogin,
      })
      await assertResponseOk(response, 200)
      const user = await parseJson(response)
      await assertSingleItem(user, {
        id: expect.any(Number),
        token: expect.any(String),
      })
    })

    test('register unsuccessfully', async ({ request }) => {
      const response = await request.post(API_ENDPOINTS.register, {
        data: TEST_OBJECTS.problemLogin,
      })
      await assertResponseError(response, 400)
      const error = await parseJson(response)
      expect(error.error).toBe(TEST_OBJECTS.errorMessage)
    })

    test('login successfully', async ({ request }) => {
      const response = await request.post(API_ENDPOINTS.login, {
        data: TEST_OBJECTS.newLogin,
      })
      await assertResponseOk(response, 200)
      const token = await parseJson(response)
      expect(token.token).not.toBeNull()
    })

    test('login unsuccessfully', async ({ request }) => {
      const response = await request.post(API_ENDPOINTS.login, {
        data: TEST_OBJECTS.problemLogin,
      })
      await assertResponseError(response, 400)
      const error = await parseJson(response)
      expect(error.error).toBe(TEST_OBJECTS.errorMessage)
    })
  })

  // Miscellaneous tests
  test('delayed response', async ({ request }) => {
    const delay = 2
    const startTime = Date.now() // Record the start time
    const response = await request.get(`${API_ENDPOINTS.users}?delay=${delay}`)
    const endTime = Date.now() // Record the end time

    // Assert the response status is 200
    await assertResponseOk(response, 200)

    // Assert the response time is within an acceptable range (e.g., 3000ms ± 500ms)
    const responseTime = endTime - startTime
    expect(responseTime).toBeGreaterThanOrEqual(delay * 1000)
    expect(responseTime).toBeLessThanOrEqual(delay * 1000 + 500)

    // Parse and validate the response
    const users = await parseJson(response)
    await assertMultipleItems(users.data, {
      firstItemProperties: { email: TEST_OBJECTS.emails.george },
    })
  })
})
