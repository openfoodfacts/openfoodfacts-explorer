<!--
Thank you for contributing to Open Food Facts Explorer!
Please provide a description of your changes below.
-->

## Description

This PR implements the "Report to Nutri-Patrol" functionality directly on product images in view mode, addressing Issue #833.

Previously, reporting an image required opening the image modal. This change adds a reporting button (flag icon) that appears on hover over product images in the Header, Knowledge Panels (e.g., Ingredients, Nutrition), and Edit Mode sections.

**Key Changes:**

- **`src/lib/ui/ImageButton.svelte`**: Added a hoverable "Report to Nutri-Patrol" button. Implemented logic to automatically extract the `image_id` from the image URL regex if it's not explicitly provided, ensuring the button works even in nested components like Knowledge Panels.
- **`src/lib/ui/images/PhotoTypeSection.svelte`**: Added the "Report to Nutri-Patrol" button to the "Edit Mode" image grid overlay.
- **Global Integration**: Updated `ProductHeader.svelte` and `IngredientsStep.svelte` to pass the `productCode` prop to `ImageButton`, enabling the reporting link to be constructed correctly.

Fixes #833

---

## Screenshots

**Before & After / Feature Demonstration:**

|                                           Before                                           |                                           After                                           |
| :----------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: |
| ![Before](https://github.com/user-attachments/assets/10d81237-50a4-4125-ad75-1f4134361fa1) | ![After](https://github.com/user-attachments/assets/a4c29bab-869c-4d47-991f-dee7d99a1de9) |

---

## Checklist:

**Author Self-Review:**

- [x] I have performed a self-review of my own code.
- [x] I understand the changes I'm proposing and why they are needed.
- [x] My changes generate no new warnings or errors (linting, console).
- [ ] I have made corresponding changes to the documentation (if applicable).

**LLM Usage Disclosure:**
_Please be transparent about the use of AI assistance._

- [ ] If I **did** use an AI Large Language Model, I have reviewed the generated code/text to ensure its accuracy, security, and relevance to the project's context and licensing.

**Triggering Code Review:**

- You can request an AI-powered code review by commenting `/gemini review` on this PR after it's been created.

<!-- You can erase any parts of this template not applicable to your Pull Request. -->
