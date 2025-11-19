import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(permissions=["clipboard-read", "clipboard-write"])
        page = await context.new_page()

        try:
            await page.goto("http://localhost:8000")

            # Click the button
            await page.click("#copy-for-llm")

            # Get the clipboard content
            clipboard_content = await page.evaluate("() => navigator.clipboard.readText()")

            # Check if the "Projects" link is in the navigation bar
            projects_link = await page.query_selector('nav a[href="#projects"]')
            if not projects_link:
                raise Exception("Projects link not found in the navigation bar")

            # Check if the projects section is in the clipboard content
            if "## Projects" not in clipboard_content:
                raise Exception("Projects section not found in the clipboard content")

            # Check if the new projects are in the clipboard content
            if "### TDListener: A Medical AI Scribe" not in clipboard_content:
                raise Exception("TDListener project not found in the clipboard content")

            if "### Global: Shared Data Space for Clinical and Hospitals" not in clipboard_content:
                raise Exception("Global project not found in the clipboard content")

            print("Verification successful!")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
