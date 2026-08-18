# Expense Tracker Mobile App

This is a simple mobile application for tracking personal expenses. It allows users to add new expenses, view a list of their expenses, and persists the data locally on the device.

## Features

- Add new expenses with a description and amount.
- View a list of all recorded expenses.
- Data persistence using local file storage.
- Loading indicator while fetching data.
- **Multi-language support:** Switch between English and Portuguese seamlessly.
- **AI Agent Integration:** Import bank statements (PDF or CSV) directly into the app. The AI automatically categorizes and adds your expenses based on your available categories. (Requires an OpenAI API Key).

## Tech Stack

- **React Native**: A framework for building native mobile apps using React.
- **Expo**: A platform for making universal native apps for Android, iOS, and the web with JavaScript and React.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- **Node.js**: Recommended LTS version (v20+).
    - *Note for Windows users:* This project includes a fix for **Node.js v24+**.
- **Expo Go**: Ensure you have the latest version installed on your mobile device (compatible with SDK 54).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project directory:**
   ```bash
   cd <project-directory>
   ```
3. **Install the dependencies:**
   Due to peer dependency requirements in recent React Native versions, use the legacy peer deps flag:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the Application

1. **Start the Expo development server:**
   We recommend running with the clear cache flag to avoid issues:
   ```bash
   npx expo start -c
   ```

2. **Running on iOS (iPhone/iPad):**
   - **Physical Device:**
     1. Install the **Expo Go** app from the App Store.
     2. Open the camera app on your iPhone and scan the QR code displayed in the terminal.
     3. Tap the notification to open the project in Expo Go.
   - **Simulator (macOS only):**
     1. Ensure you have Xcode installed.
     2. Press `i` in the terminal after starting the server to open the iOS simulator.

3. **Running on Android:**
   - **Physical Device:**
     1. Install the **Expo Go** app from the Google Play Store.
     2. Open the Expo Go app and tap "Scan QR Code".
     3. Scan the QR code displayed in the terminal.
   - **Emulator:**
     1. Ensure you have Android Studio and a virtual device set up.
     2. Press `a` in the terminal after starting the server to open the Android emulator.

### Troubleshooting

- **Windows Users**: If you encounter `mkdir` errors related to `node:sea`, this project is already configured to automatically use a patched version of the Expo CLI. Ensure you ran `npm install` correctly.
- If you encounter connection issues, ensure your phone and computer are on the same Wi-Fi network.
- You can also try running `npx expo start --tunnel` if you have network restrictions.

## New AI Feature Setup

1. Open the App and navigate to the **Settings** tab.
2. Under **AI Agent**, enter your **OpenAI API Key** and hit Save.
3. Navigate to the **Expenses** tab and click on the "Import Statement" button.
4. Select a PDF or CSV file. The AI will parse the file and automatically categorize and add the expenses!

## Code Overview

The codebase is organized into the following directories:

- **`src/models`**: Contains the data models for the application (e.g., `Expense.ts`).
- **`src/services`**: Handles data persistence and retrieval (e.g., `ExpenseService.ts`).
- **`src/viewmodels`**: Manages the application's state and business logic (e.g., `ExpenseViewModel.ts`).
- **`src/views`**: Contains the UI components and screens (e.g., `ExpenseScreen.tsx`).
- **`src/i18n`**: Contains the localization files.
- **`src/services/ai`**: Contains the OpenAI agent integration and file parsing logic.

## Contributing

Contributions are welcome! If you have any suggestions or find any issues, please feel free to open an issue or submit a pull request.
