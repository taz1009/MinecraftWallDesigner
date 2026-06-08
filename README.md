# Minecraft Wall Designer - Web Version

A Canvas 2D-based web version of the Minecraft Wall Designer that runs directly in the browser and can be deployed on GitHub Pages.

## Features

- **Drawing Tools**: Line, Rectangle, and Circle drawing tools
- **Grid Navigation**: Pan and zoom across a 2000x2000 grid
- **Pole Placement**: Automatically place poles evenly along your walls
- **Customization**: Adjust pole count and angle for circles/rectangles
- **Web-Ready**: Runs entirely in the browser with WebGL rendering
- **GitHub Pages Compatible**: Deploy directly as a static site

## Getting Started

1. Open `index.html` in a modern web browser
2. Use the toolbar to select a drawing tool
3. Click and drag on the canvas to draw shapes
4. Adjust poles and angles in the right sidebar
5. Use arrow keys or pan buttons to navigate the grid
6. Scroll to zoom in/out

## Deployment to GitHub Pages

### Option 1: Create a new repository

1. Create a new GitHub repository named `username.github.io`
2. Copy all files from the `WebGL` folder to the root of your repository
3. Commit and push to GitHub
4. Access your site at `https://username.github.io`

### Option 2: Deploy in a subdirectory

1. In an existing repository, create a `gh-pages` branch
2. Copy all WebGL files to that branch
3. Enable GitHub Pages in repository settings
4. Access your site at `https://username.github.io/repo-name`

## File Structure

- `index.html` - Main HTML structure and UI layout
- `app.js` - Main application logic, WebGL rendering, and event handling
- `geometry.js` - Geometric utilities for line/circle/rectangle calculations
- `styles.css` - UI styling

## Browser Requirements

- Canvas 2D support (all modern browsers)
- Modern browser (Chrome 4+, Firefox 1.5+, Safari 2+, Edge all versions)

## Controls

- **Line Tool**: Click and drag to draw a line
- **Rectangle Tool**: Click and drag to draw a rectangle outline
- **Circle Tool**: Click and drag from center to create a circle
- **Erase Tool**: Click to remove a shape at that location
- **Pan Buttons**: Use arrow buttons or arrow keys to move around
- **Zoom**: Scroll wheel or use the zoom display
- **Undo**: Click "Undo Last Line" button

## Notes

- The grid is 2000x2000 units
- Poles are automatically placed evenly along each drawn shape
- You can customize the number of poles per shape using the controls in the right sidebar
- For circles and rectangles, you can also adjust the starting angle for pole placement
