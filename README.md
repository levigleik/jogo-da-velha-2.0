This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel
# Ultimate Tic Tac Toe 2.0

Ultimate Tic Tac Toe 2.0 is an advanced and more strategic version of the traditional Tic Tac Toe game. This version enhances gameplay with a nested board structure, providing not only a fun experience but also a challenging test of strategy for players.

## Features

- **Dynamic Gameplay**: Nested 3x3 boards allow for a more strategic game.
- **Responsive Design**: Built to work seamlessly across all modern devices.
- **Persistent State**: Saves your progress locally, so you can resume games where you left off.
- **Interactive Animations**: Leveraging `framer-motion` for visually appealing transitions.

## Technologies Used

This project utilizes the following tools and frameworks:

- **React** (v19.1.0): For building a responsive and interactive UI.
- **Next.js** (v15.5.4): For a seamless server-side rendering experience.
- **TypeScript**: To ensure type safety and improved developer experience.
- **Framer Motion** (v12.23.22): For smooth animations and motion effects.
- **TailwindCSS**: To style the application efficiently with utility-first CSS.
- **React Query** (@tanstack/react-query v5.90.2): For managing state related to server state.
- **Bun Package Manager**: For fast package management and dependency resolution.

## Rules of Ultimate Tic Tac Toe 2.0

The game builds on the classic Tic Tac Toe rules with an added twist:

1. **Board Layout**: The game consists of 9 smaller Tic Tac Toe boards arranged in a 3x3 grid, collectively making up a larger board.
2. **Gameplay Sequence**:
   - Players take turns as "X" and "O."
   - On each turn, a player marks a cell in one of the smaller boards.
3. **Selective Board Activation**:
   - The spot played in the smaller board dictates which smaller board the opponent must play in next. For example, if you mark the top-left cell, your opponent must play in the top-left smaller board.
   - If the corresponding board is already completed, the opponent may choose any other available board.
4. **Winning a Board**:
   - Each smaller board acts as an independent Tic Tac Toe game.
   - A player wins a smaller board by completing a row, column, or diagonal.
5. **Overall Victory**:
   - The goal is to win three smaller boards in a row, column, or diagonal on the larger board.
   - If all boards are filled and no player has achieved three in a row, the game is declared a draw.

## How to Run the Project

1. **Install Dependencies**:
   Use Bun package manager to install dependencies:
   ```bash
   bun install
   ```
2. **Run the Development Server**:
   Start the development server:
   ```bash
   bun dev
   ```
3. Open your browser and navigate to the provided development URL.

## License

Distributed under the MIT License. See `LICENSE` for more information.
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
