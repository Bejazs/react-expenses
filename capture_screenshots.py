import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("Navigating to http://localhost:8081")
        page.goto("http://localhost:8081", timeout=60000)

        # Wait for app to be ready
        page.wait_for_timeout(10000)

        # 1. Capture Dashboard (Initial)
        print("Taking Dashboard screenshot")
        page.screenshot(path="01_Dashboard.png")

        # 2. Capture Expenses Tab
        print("Navigating to Expenses")
        page.get_by_text("Expenses").last.click()
        page.wait_for_timeout(3000)
        page.screenshot(path="02_Expenses_Tab.png")

        # 3. Capture Categories Tab
        print("Navigating to Categories")
        page.get_by_text("Categories").last.click()
        page.wait_for_timeout(3000)
        page.screenshot(path="03_Categories_Tab.png")

        # 4. Add Expense Flow
        print("Adding Expense...")
        # Go back to Dashboard
        page.get_by_text("Dashboard").last.click()
        page.wait_for_timeout(2000)

        # Click the FAB using testID
        print("Clicking Add Button (FAB)")
        page.locator('[data-testid="add-expense-btn"]').click()
        page.wait_for_timeout(2000)

        # Now in Modal
        print("Filling Expense Form")
        page.get_by_placeholder("Description").fill("Groceries")
        page.get_by_placeholder("Amount").fill("50")

        # Select Category "Food" inside the dialog
        # If get_by_role("dialog") fails (some versions/implementations), we can try .last
        # But the error message suggested it exists.
        print("Selecting Category")
        # Trying .last first as it is simpler and covers the case where dialog role isn't perfect but element is last added.
        # But wait, the Pie chart is behind the modal. So "Food" in Legend is first, "Food" in Modal is second.
        page.get_by_text("Food", exact=True).last.click()

        # Save
        print("Saving Expense")
        page.get_by_text("Save", exact=True).last.click()
        page.wait_for_timeout(3000)

        # 5. Capture Dashboard (Updated)
        print("Taking Updated Dashboard screenshot")
        page.screenshot(path="04_Dashboard_Updated.png")

        # 6. Capture Expenses List (Updated)
        print("Navigating to Expenses List")
        page.get_by_text("Expenses").last.click()
        page.wait_for_timeout(3000)
        page.screenshot(path="05_Expenses_Updated.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="error_state.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
