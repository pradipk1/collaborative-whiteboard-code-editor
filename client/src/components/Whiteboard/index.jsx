import { useEffect, useRef, useState } from "react";
import {Stage, Layer, Line, Rect, Text, Circle} from 'react-konva';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import RenderShape from "./renderShape.jsx";

import './whiteboard.css';

function Whiteboard({leftWidth, socket, username, roomId}) {
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
    }, []);

    // set the canvas width and height
    useEffect(() => {
        if(!canvasContRef) return;
        setBoardDimension({
            width: canvasContRef.current.clientWidth,
            height: canvasContRef.current.clientHeight
        });
    }, [leftWidth]);

    // send local yjs doc update
    useEffect(() => {
        const sendUpdate = (update, origin) => {
            if(origin === 'remote') return;

            socket.emit('canvas-update', {roomId, update});
        }

        yDocRef.current.on('update', sendUpdate);

        return () => yDocRef.current.off('update', sendUpdate);
    }, [roomId, socket, yDocRef.current]);

    // receive yjs doc update
    useEffect(() => {
        const receiveUpdate = (update) => {
            Y.applyUpdate(yDocRef.current, new Uint8Array(update), 'remote');
        }

        socket.on('init-doc-state', receiveUpdate);

        socket.on('canvas-update', receiveUpdate);

        return () => {
            socket.off('init-doc-state', receiveUpdate);
            socket.off('canvas-update', receiveUpdate);
        }
    }, [yDocRef.current, socket]);

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
                <button onClick={() => {yShapesMap.clear()}}>Clear Canvas</button>
            </div>

            <div className="canvasCont" ref={canvasContRef}>
                {
                    canvasContRef.current && 
                    <Stage 
                        width={boardDimension.width} 
                        height={boardDimension.height}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            handleMouseMove(e);
                        }}
                        onMouseUp={handleMouseUp}
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