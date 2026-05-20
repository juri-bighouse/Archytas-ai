Replace the placeholder node renderer with proper shape rendering and a drag preview.

## Implementation

1. Replace the placeholder node shape rendering.
   - rectangle, pill, and circle should use CSS styling
   - diamond, hexagon, and cylinder should render with SVG shapes
   - SVG shapes should scale with node size
   - keep borders subtle at rest and brighter when selected

2. Add a shape drag preview.
   - when dragging a shape from the shape panel, show a ghost preview of that shape
   - keep the preview attached to the cursor while dragging
   - use the same shape type and default size that will be used on drop
   - hide the preview after the shape is dropped or the drag is cancelled
   - keep this limited to drag preview behavior only

3. Add connection handles so shapes can be wired together.
   - render a connection handle on each of the four sides of a node
   - handles are small white circles, hidden by default and revealed on node hover
   - handles use the canvas's loose connection mode so any side can connect to any side

4. Keep node rendering connected to the existing collaborative canvas state.

## Scope Limits

- don't rebuild shape panel layout
- don't change how dropped nodes are created
- don't add resize or label editing yet
- keep drag/drop changes limited to the ghost preview only
- edges render with React Flow defaults; custom edge styling is a separate unit

## Check When Done

- Nodes render the correct shape variant for each type.
- CSS shapes render correctly for rectangle, pill, and circle.
- SVG shapes render and scale correctly for diamond, hexagon, and cylinder.
- Shape dragging shows a ghost preview matching the dragged shape.
- Each node reveals four connection handles on hover, and shapes can be connected with edges.
- `npm run build` passes without type errors.
