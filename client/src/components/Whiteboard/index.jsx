import { useEffect, useRef, useState } from "react";
import {Stage, Layer, Line, Rect, Text, Circle} from 'react-konva';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import RenderShape from "./renderShape.jsx";

import './whiteboard.css';

function Whiteboard({leftWidth, socket}) {
    const [shapes, setShapes] = useState([]);
    const [boardDimension, setBoardDimension] = useState(null);
    const [tool, setTool] = useState('line');
    const [color, setColor] = useState('#ffffff');
    const [remoteUsers, setRemoteUsers] = useState({});

    const canvasContRef = useRef(null);
    const isDrawing = useRef(false);

    const yDocRef =useRef(new Y.Doc());
    const yShapesMap = yDocRef.current.getMap('yShapes');
    const lastShapeIdRef = useRef(null);
    const awarenessRef = useRef(null);

    // update the shapeMap doc whenever a new shape is drawn
    const updateYShapesMap = (id, shape) => {
        yShapesMap.set(id, JSON.stringify(shape));
        // console.log(yShapesMap);
    }

    // handle mouseDown event inside canvas 
    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        const id = Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const createdAt = Date.now();
        lastShapeIdRef.current = id;

        if(tool === 'line') {
            const newLine = {
                id,
                type: 'line',
                points: [pos.x, pos.y],
                fill: color,
                color,
                strokeWidth: 3,
                createdAt
            }
            setShapes([...shapes, newLine]);
            updateYShapesMap(newLine.id, newLine);
        } else if(tool === 'rect') {
            const newRect = {
                id,
                type: 'rect',
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                color,
                createdAt
            }
            setShapes([...shapes, newRect]);
            updateYShapesMap(newRect.id, newRect);
        } else if(tool === 'circle') {
            const newCircle = {
                id,
                type: 'circle',
                x: pos.x,
                y: pos.y,
                radius: 0,
                color,
                createdAt
            }
            setShapes([...shapes, newCircle]);
            updateYShapesMap(newCircle.id, newCircle);
        } else if(tool === 'text') {
            const textVal = prompt('Enter your text');
            if(!textVal) return;
            const newText = {
                id,
                type: 'text',
                x: pos.x,
                y: pos.y,
                text: textVal,
                color,
                createdAt
            }
            setShapes([...shapes, newText]);
            updateYShapesMap(newText.id, newText);
            isDrawing.current = false;
        }
    }

    // handle mouse movement inside canvas
    const handleMouseMove = (e) => {
        if(!isDrawing.current || tool === 'text' || !lastShapeIdRef.current) return;

        const lastShape = JSON.parse(yShapesMap.get(lastShapeIdRef.current));
        if(!lastShape) return;

        const pos = e.target.getStage().getPointerPosition();
        // const updatedShapes = [...shapes];
        // const lastShape = updatedShapes[updatedShapes.length - 1];

        // if(!lastShape) return;

        if(lastShape.type === 'line' && tool === 'line') {
            lastShape.points = lastShape.points.concat([pos.x, pos.y]);
            lastShape.points = lastShape.points.concat([pos.x, pos.y]);
            
        } else if(lastShape.type === 'rect' && tool === 'rect') {
            lastShape.width = pos.x - lastShape.x;
            lastShape.height = pos.y - lastShape.y;
        } else if (lastShape.type === 'circle' && tool === 'circle') {
            const distX = pos.x - lastShape.x;
            const distY = pos.y - lastShape.y;
            lastShape.radius = Math.sqrt(distX * distX + distY * distY);
        }

        updateYShapesMap(lastShape.id, lastShape);

        // setShapes(updatedShapes);
    }

    // handle mouse up event inside canvas
    const handleMouseUp = (e) => {
        isDrawing.current = false;
        lastShapeIdRef.current = null;
    }

    // copy all shapes from yShapesMap to shapes state to render on UI
    useEffect(() => {
        const updateShapes = () => {
             const shapesList = [];
            yShapesMap.forEach(v => {
                shapesList.push(JSON.parse(v));
            });

            shapesList.sort((a, b) => a.createdAt - b.createdAt);
            setShapes(shapesList);
        }

        updateShapes();
         yShapesMap.observe(updateShapes);

        return () => {yShapesMap.unobserve(updateShapes)}
    }, [yShapesMap]);

    // set the canvas width and height
    useEffect(() => {
        if(!canvasContRef) return;
        setBoardDimension({
            width: canvasContRef.current.clientWidth,
            height: canvasContRef.current.clientHeight
        });
    }, [leftWidth]);

    useEffect((e) => {
        const doc = yDocRef.current;

        // Establish the Awareness instance bound to this doc
        const awareness = new awarenessProtocol.Awareness(yDocRef.current);
        awarenessRef.current = awareness;

        // Initialize document structural data from server
        socket.on('init-doc-state', initialState => {
            Y.applyUpdate(doc, new Uint8Array(initialState));
        });

        // Receive document synchronization data fragments from other peers
        socket.on('canvas-update', update => {
            Y.applyUpdate(doc, Uint8Array(update));
        });

        // Receive awareness delta frames from other peers
        socket.on('awareness-update', awarenessUpdate => {
            awarenessProtocol.applyAwarenessUpdate(awarenessRef.current, new Uint8Array(awarenessUpdate), socket);
        });

        // Emit local canvas edits to backend server
        doc.on('update', (update, origin) => {
            if(origin !== socket) { // Prevent circular echo loops
                socket.emit('canvas-update', update);
            }
        });

        // Emit local awareness modifications (such as moving the mouse)
        awareness.on('update', ({added, updated, removed}, origin) => {
            if(origin !== socket) {
                const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]);
                socket.emit('awareness-update', awarenessUpdate);
            }
        });

        // Read incoming state updates to refresh local UI components
        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const usersMap = {};

            states.forEach((state, clientID) => {
                if(clientID === awareness.clientID) return // ignore self

                if(state.user && state.user.cursor) {
                    usersMap[clientID] = {
                        name: state.user.name,
                        color: state.user.color,
                        x: state.user.cursor.x,
                        y: state.user.cursor.y
                    }
                }
            });
            setRemoteUsers(usersMap);
        }

        awareness.on('change', handleAwarenessChange);

        // Set initial configuration parameters for local user context profile
        awareness.setLocalStateField('user', {name: 'pradip', color: 'red', cursor: null});

        // yDocRef.current.on('update', (u, o) => {console.log(u, o)})

        return () => {
            doc.destroy();
        }
    }, []);

    // Request Animation Frame (rAF) throttle for rendering performance optimization
  let isMoving = false;
  const handleMouseMoveCursor = (e) => {
    if (isMoving || !awarenessRef.current) return;
    isMoving = true;

    requestAnimationFrame(() => {
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();

      if (pointerPosition) {
        const currentUser = awarenessRef.current.getLocalState()?.user || {};
        awarenessRef.current.setLocalStateField('user', {
          ...currentUser,
          cursor: { x: pointerPosition.x, y: pointerPosition.y },
        });
      }
      isMoving = false;
    });
  };

  const handleMouseLeave = () => {
    if (!awarenessRef.current) return;
    const currentUser = awarenessRef.current.getLocalState()?.user || {};
    awarenessRef.current.setLocalStateField('user', {
      ...currentUser,
      cursor: null, // Wipe element bounds to hide indicator offscreen
    });
  };

    return (
        <div className="whiteboardCont">
            <div className="toolsBtnCont">
                {
                    ['line', 'rect', 'circle', 'text'].map(t => (
                        <button className="toolBtn"
                            key={t}
                            onClick={() => setTool(t)}
                            style={{backgroundColor: tool === t ? '#007acc' : '#444'}}
                        >{t}</button>
                    ))
                }
            </div>
            <div className="changeColorInp-clearBtn">
                <span>Change Color: </span>
                <input type="color" value={color} 
                    className="colorInp"
                    onChange={(e) => {setColor(e.target.value)}}
                />
                <button onClick={() => setShapes([])}>Clear Canvas</button>
            </div>

            <div className="canvasCont" ref={canvasContRef} onMouseLeave={handleMouseLeave}>
                {
                    canvasContRef.current && 
                    <Stage 
                        width={boardDimension.width} 
                        height={boardDimension.height}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            handleMouseMove(e);
                            handleMouseMoveCursor(e);
                        }}
                        onMouseUp={handleMouseUp}
                        // onMouseLeave={() => {isDrawing.current = false}}
                    >
                        <Layer>
                            {/* render all the shapes */}
                            {shapes.map(shape => <RenderShape shape={shape} />)}
                        </Layer>
                    </Stage>
                }
            </div>
        </div>
    )
}

export default Whiteboard;