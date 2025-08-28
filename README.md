# MindShift - Strategic Puzzle Battle Game

## Project Overview

MindShift is a strategic puzzle battle game that blends the visual satisfaction of match-3 games with the tactical depth of chess. Set in a vibrant 2.5D isometric environment, the game challenges players to outmaneuver their opponents on a dynamic 6x6 grid using unique tile types and strategic pattern matching. The goal is to create a polished, user-friendly experience that offers deep gameplay and visual appeal.

## Features

### Game Mechanics
*   **Board**: A 6x6 isometric grid with a floating, glowing design.
*   **Turn-based Gameplay**: Players take turns with a 60-second timer per turn.
*   **Tile Types**:
    *   **Rook**: Moves horizontally and vertically.
    *   **Bishop**: Moves diagonally.
    *   **Knight**: Performs L-shaped jumps.
    *   **Queen**: Moves in any direction (limited range).
    *   **Trap**: Blocks movement.
    *   **Power**: Boosts combo potential.
*   **Pattern System**: Match 3 or more tiles of the same type in a line, or create special shapes (L, T) for bonus points and effects.
*   **Win Conditions**: Achieve victory by eliminating key opponent tiles, controlling 70% of the board's zones, or reaching the highest score.
*   **Mutation Mechanic**: Random tiles on the board change their type every 3 rounds, adding a dynamic element to gameplay.
*   **Undo System**: Players have a limited number of undos per turn (2 per player).

### Visual Design (2.5D Isometric)
*   **Art Style**: Clean, modern aesthetic with subtle realistic shadows and a sci-fi neon theme.
*   **Animations**: Smooth tile movements, particle effects for matches and combos, and glowing trails.
*   **Color Palette**: High-contrast design with colorblind-friendly options.
*   **UI Elements**: Features floating buttons, translucent panels, and elegant typography for a premium feel.

### User Experience
*   **Onboarding**: Designed for progressive complexity, starting with basic mechanics.
*   **Movement Indicators**: Ghost movement indicators help players visualize moves before committing.
*   **Scalable UI**: Responsive design optimized for various screen sizes and devices.

## Game Modes (Current Implementation)
*   **AI Opponent**: Play against a strategic AI with adjustable difficulty levels.

## Technical Stack

This project is built as a web application using the following technologies:

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Game Logic**: Custom implementations in TypeScript for board management, tile movements, and combo detection.
*   **AI System**: Minimax algorithm with alpha-beta pruning for the AI opponent.

## Installation and Setup

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd mindshift
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    This will typically open the application in your browser at `http://localhost:5173`.

## Usage

Once the application is running, you can interact with the game board:
*   **Select a Tile**: Click on one of your tiles to select it. Possible moves will be highlighted.
*   **Move a Tile**: Click on a highlighted square to move your selected tile to that position.
*   **Undo**: Use the undo button to revert your last move (limited uses).
*   **AI Turn**: After your turn, the AI will make its move.

## Contributing

Contributions are welcome! Please feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License.