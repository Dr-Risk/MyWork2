# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this application on your local machine, follow these steps.

### 1. Set Up Environment Variables

The application uses Genkit for its AI features, which requires an API key from Google AI.

1.  Create a copy of the `.env.example` file and name it `.env.local`.
    ```bash
    cp .env.example .env.local
    ```
2.  Open the new `.env.local` file.
3.  Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  Replace `YOUR_API_KEY_HERE` with your actual key.

### 2. Install Dependencies

Open your terminal in the project's root directory and run the following command to install the necessary packages:

```bash
npm install
```

### 3. Run the Development Servers

This application requires two separate processes to run concurrently in two separate terminal windows.

**Terminal 1: Start the Next.js App**

This command starts the main web application.

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

**Terminal 2: Start the Genkit AI Flows**

This command starts the Genkit server, which runs your AI logic. The `--watch` flag will automatically restart the server when you make changes to your AI flows.

```bash
npm run genkit:watch
```

This will start the Genkit development UI, typically on `http://localhost:4000`, where you can inspect and test your AI flows.
