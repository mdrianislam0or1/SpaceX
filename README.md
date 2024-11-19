# SpaceX Landing Pads Visualization

This project is a Svelte-based web application that visualizes SpaceX landing pad data. It provides an interactive interface to explore information about various SpaceX landing pads, including their locations, status, and success rates.

## Features

- Fetches and displays landing pad data from the SpaceX API
- Interactive map showing landing pad locations
- List and grid view options for landing pad information
- Filtering capability based on landing pad status
- Detailed modal view for each landing pad
- Success rate visualization using a doughnut chart

## Technologies Used

- Svelte 5
- SvelteKit
- Flowbite Svelte for UI components
- OpenLayers for map integration
- Chart.js for data visualization
- Tailwind CSS for styling

## Ui
![Spacex](https://github.com/user-attachments/assets/a3c8ff96-9777-4090-9efb-e5cf09099870)

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mdrianislam0or1/SpaceX.git
   ```

2. Navigate to the project directory:
   ```
   cd SpaceX
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Application

To start the development server:

```
npm run dev
```

or

```
yarn dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

To create a production build:

```
npm run build
```

or

```
yarn build
```

## Deployment

This project is configured to be deployed on Vercel. Simply connect your GitHub repository to Vercel, and it will automatically deploy your application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
