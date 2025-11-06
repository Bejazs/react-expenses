# Expense Tracker Mobile App

This is a simple mobile application for tracking personal expenses. It allows users to add new expenses, view a list of their expenses, and persists the data locally on the device.

## Features

- Add new expenses with a description and amount.
- View a list of all recorded expenses.
- Data persistence using local file storage.
- Loading indicator while fetching data.

## Tech Stack

- **React Native**: A framework for building native mobile apps using React.
- **Expo**: A platform for making universal native apps for Android, iOS, and the web with JavaScript and React.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- Expo Go app on your mobile device or an Android/iOS emulator.

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
   ```bash
   npm install
   ```

### Running the Application

1. **Start the Expo development server:**
   ```bash
   npm start
   ```
2. **Scan the QR code:**
   - Open the Expo Go app on your mobile device and scan the QR code displayed in the terminal.
   - Alternatively, you can run the app on an emulator by selecting the appropriate option in the terminal.

## Code Overview

The codebase is organized into the following directories:

- **`src/models`**: Contains the data models for the application (e.g., `Expense.ts`).
- **`src/services`**: Handles data persistence and retrieval (e.g., `ExpenseService.ts`).
- **`src/viewmodels`**: Manages the application's state and business logic (e.g., `ExpenseViewModel.ts`).
- **`src/views`**: Contains the UI components and screens (e.g., `ExpenseScreen.tsx`).

## Contributing

Contributions are welcome! If you have any suggestions or find any issues, please feel free to open an issue or submit a pull request.
