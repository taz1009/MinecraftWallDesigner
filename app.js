// Minecraft Wall Designer - Canvas 2D Version
const GRID_SIZE = 2000;
const MIN_CELL_SIZE = 12;
const MAX_CELL_SIZE = 48;

// State
let state = {
    viewX: 1000,
    viewY: 1000,
    cellSize: 24,
    tool: 'line',
    numPoles: 5,
    lines: [],
    drawingLine: null,
    circlePoleAngle: 0,
    windowCols: 41,
    windowRows: 41,
};

// Canvas context
let canvas = null;
let ctx = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('glCanvas');
    ctx = canvas.getContext('2d');
    
    if (!ctx) {
        alert('Canvas 2D not supported in this browser.');
        return;
    }
    
    // Setup UI event listeners
    setupUIListeners();
    
    // Start render loop
    renderLoop();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    handleResize();
});

function handleResize() {
    const canvas = document.getElementById('glCanvas');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    state.windowCols = Math.max(5, Math.floor(canvas.width / state.cellSize));
    state.windowRows = Math.max(5, Math.floor(canvas.height / state.cellSize));
}

function setupUIListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.tool = btn.dataset.tool;
        });
    });
    
    // Undo button
    document.querySelector('.undo-btn').addEventListener('click', () => {
        if (state.lines.length > 0) {
            state.lines.pop();
            updateLinesList();
        }
    });
    
    // Pan buttons
    document.querySelectorAll('.pan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pan = btn.dataset.pan;
            const panAmount = 1;
            if (pan === 'up') state.viewY = Math.max(0, Math.min(GRID_SIZE - 1, state.viewY - panAmount));
            if (pan === 'down') state.viewY = Math.max(0, Math.min(GRID_SIZE - 1, state.viewY + panAmount));
            if (pan === 'left') state.viewX = Math.max(0, Math.min(GRID_SIZE - 1, state.viewX - panAmount));
            if (pan === 'right') state.viewX = Math.max(0, Math.min(GRID_SIZE - 1, state.viewX + panAmount));
            updateViewPosition();
        });
    });
    
    // Num poles input
    document.getElementById('numPoles').addEventListener('change', (e) => {
        state.numPoles = Math.max(2, Math.min(50, Number(e.target.value)));
    });
    
    // Canvas events
    const canvas = document.getElementById('glCanvas');
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('wheel', handleCanvasWheel);
    
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
    
    updateViewPosition();
}

function handleCanvasMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / state.cellSize);
    const y = Math.floor((e.clientY - rect.top) / state.cellSize);
    
    const gx = x + state.viewX - Math.floor(state.windowCols / 2);
    const gy = y + state.viewY - Math.floor(state.windowRows / 2);
    
    if (state.tool === 'erase') {
        const idx = state.lines.findIndex(line => 
            line.coords.some(([lx, ly]) => lx === gx && ly === gy)
        );
        if (idx !== -1) {
            state.lines.splice(idx, 1);
            updateLinesList();
        }
    } else {
        state.drawingLine = { start: [gx, gy], end: [gx, gy] };
    }
}

function handleCanvasMouseMove(e) {
    if (!state.drawingLine || state.tool === 'erase') return;
    
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / state.cellSize);
    const y = Math.floor((e.clientY - rect.top) / state.cellSize);
    
    const gx = x + state.viewX - Math.floor(state.windowCols / 2);
    const gy = y + state.viewY - Math.floor(state.windowRows / 2);
    
    state.drawingLine.end = [gx, gy];
    updateDrawingInfo();
}

function handleCanvasMouseUp() {
    if (!state.drawingLine || state.tool === 'erase') return;
    
    const { start, end } = state.drawingLine;
    let newCoords = [];
    
    if (state.tool === 'line') {
        newCoords = getLineCoords(start[0], start[1], end[0], end[1]);
        state.lines.push({ coords: newCoords, poles: state.numPoles, type: 'line' });
    } else if (state.tool === 'circle') {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        let r = Math.round(Math.sqrt(dx * dx + dy * dy));
        r = Math.max(1, r);
        newCoords = getMidpointCircleCoords(start[0], start[1], r);
        state.lines.push({ coords: newCoords, poles: state.numPoles, poleAngle: state.circlePoleAngle, radius: r, type: 'circle' });
    } else if (state.tool === 'rectangle') {
        newCoords = getRectangleCoords(start[0], start[1], end[0], end[1]);
        state.lines.push({ coords: newCoords, poles: state.numPoles, poleAngle: state.circlePoleAngle, type: 'rectangle' });
    }
    
    state.drawingLine = null;
    updateLinesList();
    updateDrawingInfo();
}

function handleCanvasWheel(e) {
    e.preventDefault();
    const oldSize = state.cellSize;
    state.cellSize -= Math.sign(e.deltaY) * 4;
    state.cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, state.cellSize));
    
    if (state.cellSize !== oldSize) {
        handleResize();
    }
    
    document.getElementById('cellSize').textContent = state.cellSize;
}

function handleKeyDown(e) {
    if (e.target.tagName === 'INPUT') return;
    
    if (e.key === 'ArrowUp') { e.preventDefault(); state.viewY = Math.max(0, Math.min(GRID_SIZE - 1, state.viewY - 1)); updateViewPosition(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); state.viewY = Math.max(0, Math.min(GRID_SIZE - 1, state.viewY + 1)); updateViewPosition(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); state.viewX = Math.max(0, Math.min(GRID_SIZE - 1, state.viewX - 1)); updateViewPosition(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); state.viewX = Math.max(0, Math.min(GRID_SIZE - 1, state.viewX + 1)); updateViewPosition(); }
}

function updateViewPosition() {
    document.getElementById('viewX').textContent = state.viewX;
    document.getElementById('viewY').textContent = state.viewY;
}

function updateDrawingInfo() {
    const infoEl = document.getElementById('drawInfo');
    if (!state.drawingLine) {
        infoEl.textContent = '';
        return;
    }
    
    let previewLine = [];
    let previewRadius = 0;
    
    if (state.tool === 'line') {
        previewLine = getLineCoords(state.drawingLine.start[0], state.drawingLine.start[1], state.drawingLine.end[0], state.drawingLine.end[1]);
    } else if (state.tool === 'circle') {
        const dx = state.drawingLine.end[0] - state.drawingLine.start[0];
        const dy = state.drawingLine.end[1] - state.drawingLine.start[1];
        let r = Math.round(Math.sqrt(dx * dx + dy * dy));
        r = Math.max(1, r);
        previewRadius = r;
        previewLine = getMidpointCircleCoords(state.drawingLine.start[0], state.drawingLine.start[1], r);
    } else if (state.tool === 'rectangle') {
        previewLine = getRectangleCoords(state.drawingLine.start[0], state.drawingLine.start[1], state.drawingLine.end[0], state.drawingLine.end[1]);
    }
    
    if (state.tool === 'circle') {
        infoEl.textContent = `Drawing ${state.tool}: radius ${previewRadius}`;
    } else {
        infoEl.textContent = `Drawing ${state.tool}: ${previewLine.length} blocks`;
    }
}

function updateLinesList() {
    const listEl = document.getElementById('linesList');
    
    if (state.lines.length === 0) {
        listEl.innerHTML = '<div class="empty-state">No lines drawn.</div>';
        return;
    }
    
    listEl.innerHTML = state.lines.map((line, idx) => {
        let title = line.type === 'rectangle' ? 'Rectangle' : line.type.charAt(0).toUpperCase() + line.type.slice(1);
        title += ` ${idx + 1}: ${line.coords.length} blocks`;
        if (line.type === 'circle' && line.radius) {
            title += `, radius ${line.radius}`;
        }
        
        const polesCount = getPoles(line.coords, line.poles).length;
        
        let angleControl = '';
        if (line.type === 'circle' || line.type === 'rectangle') {
            angleControl = `
                <div style="margin-top: 4px;">
                    <label style="font-size: 12px;">Angle:</label>
                    <input type="number" class="angle-input" data-idx="${idx}" min="0" max="359" value="${line.poleAngle || 0}" style="width: 50px; margin-left: 4px;">
                </div>
            `;
        }
        
        return `
            <div class="line-item">
                <div class="line-item-title">${title}</div>
                <div class="line-item-controls">
                    Poles: ${polesCount}
                    <input type="number" class="poles-input" data-idx="${idx}" min="2" max="50" value="${line.poles}" style="width: 50px; margin-left: 4px;">
                    ${angleControl}
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for inputs
    document.querySelectorAll('.poles-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = Number(e.target.dataset.idx);
            state.lines[idx].poles = Math.max(2, Math.min(50, Number(e.target.value)));
        });
    });
    
    document.querySelectorAll('.angle-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = Number(e.target.dataset.idx);
            state.lines[idx].poleAngle = Number(e.target.value) % 360;
        });
    });
}

function getAllPoles() {
    const allPoles = [];
    state.lines.forEach(line => {
        if (line.type === 'circle' && line.coords.length > 0) {
            const cx = line.coords.reduce((sum, pt) => sum + pt[0], 0) / line.coords.length;
            const cy = line.coords.reduce((sum, pt) => sum + pt[1], 0) / line.coords.length;
            getCirclePoles(line.coords, Math.round(cx), Math.round(cy), line.poles, line.poleAngle || 0).forEach(pole => allPoles.push(pole));
        } else {
            getPoles(line.coords, line.poles).forEach(pole => allPoles.push(pole));
        }
    });
    return allPoles;
}

function buildRenderData() {
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= state.windowCols; i++) {
        const x = i * state.cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    
    for (let i = 0; i <= state.windowRows; i++) {
        const y = i * state.cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    
    // Get all poles
    const allPoles = getAllPoles();
    const poleSet = new Set(allPoles.map(p => p.join(',')));
    
    // Get preview coordinates
    let previewCoords = [];
    if (state.drawingLine && state.tool !== 'erase') {
        if (state.tool === 'line') {
            previewCoords = getLineCoords(state.drawingLine.start[0], state.drawingLine.start[1], state.drawingLine.end[0], state.drawingLine.end[1]);
        } else if (state.tool === 'circle') {
            const dx = state.drawingLine.end[0] - state.drawingLine.start[0];
            const dy = state.drawingLine.end[1] - state.drawingLine.start[1];
            let r = Math.round(Math.sqrt(dx * dx + dy * dy));
            r = Math.max(1, r);
            previewCoords = getMidpointCircleCoords(state.drawingLine.start[0], state.drawingLine.start[1], r);
        } else if (state.tool === 'rectangle') {
            previewCoords = getRectangleCoords(state.drawingLine.start[0], state.drawingLine.start[1], state.drawingLine.end[0], state.drawingLine.end[1]);
        }
    }
    
    // Draw cells
    const cellPadding = 0.025; // 2.5% padding like original
    
    for (let y = 0; y < state.windowRows; y++) {
        for (let x = 0; x < state.windowCols; x++) {
            const gx = x + state.viewX - Math.floor(state.windowCols / 2);
            const gy = y + state.viewY - Math.floor(state.windowRows / 2);
            
            const screenX = x * state.cellSize;
            const screenY = y * state.cellSize;
            
            const isPole = poleSet.has(gx + ',' + gy);
            const isWall = state.lines.some(line => line.coords.some(([lx, ly]) => lx === gx && ly === gy));
            const isPreview = previewCoords.some(([lx, ly]) => lx === gx && ly === gy);
            
            if (!isPole && !isWall && !isPreview) continue;
            
            // Calculate cell size with padding
            const size = state.cellSize * (1 - cellPadding * 2);
            const offsetX = state.cellSize * cellPadding;
            const offsetY = state.cellSize * cellPadding;
            
            const x1 = screenX + offsetX;
            const y1 = screenY + offsetY;
            
            // Draw cell
            if (isPole) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x1, y1, size, size);
                ctx.strokeStyle = '#8B4513';
            } else if (isPreview) {
                ctx.fillStyle = '#6666ff';
                ctx.fillRect(x1, y1, size, size);
                ctx.strokeStyle = '#6666ff';
            } else if (isWall) {
                ctx.fillStyle = '#aaa';
                ctx.fillRect(x1, y1, size, size);
                ctx.strokeStyle = '#aaa';
            }
            
            ctx.lineWidth = 1;
            ctx.strokeRect(x1, y1, size, size);
        }
    }
}

function renderLoop() {
    buildRenderData();
    requestAnimationFrame(renderLoop);
}
