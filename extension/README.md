# Leetcards Safe Capture

This optional Manifest V3 extension has two explicit-click modes:

- Capture the currently open LeetCode problem's public metadata.
- Export every unique accepted problem from the signed-in submission history,
  including one accepted implementation per problem.

It has no persistent host access and does not request cookie, history,
network-interception, file, download, or incognito permissions.

## Install locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on Developer mode.
3. Choose **Load unpacked**.
4. Select this `extension` directory.

For one problem, leave its LeetCode problem page open and choose **Capture this
problem only**. The extension reads the title, slug, difficulty, visible tags,
URL, and capture time. It sends that small payload in the URL fragment to
Leetcards. URL fragments are not sent to the GitHub Pages server.

For the whole profile, open LeetCode while signed in and choose **Export all
solved problems**. A persistent extension page walks the submission history,
keeps the newest accepted submission encountered for each unique problem,
retrieves that accepted code, and creates `leetcards-leetcode-import.json`.
Import that file from the Questions page in Leetcards.

The main app validates the payload and stores the solved marker in local
IndexedDB. When a reliable authored explanation exists, the capture links to
it. Otherwise the solved marker remains visible and is clearly labeled
`Explanation not available`; Leetcards does not generate an unverified answer.

## Security boundary

- `activeTab` grants temporary access only after the user clicks the extension.
- `scripting` is used only to read the current tab in an isolated world.
- There are no `host_permissions`.
- Single-problem capture does not read submitted code or account details.
- Profile export reads one accepted implementation per unique problem only
  after the user chooses the bulk action.
- The exported file omits account identity, cookies, session tokens, passwords,
  dates, runtime, memory, failed submissions, and submission URLs.
- Accepted code stays in the downloaded JSON file and the app's local
  IndexedDB. It is not uploaded by Leetcards.
- No remote JavaScript is loaded by the extension.
