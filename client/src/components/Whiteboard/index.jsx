import { useEffect, useRef, useState } from "react";
import {Stage, Layer, Line, Rect, Text, Circle} from 'react-konva';
import './whiteboard.css';

function Whiteboard({leftWidth}) {
    const [shapes, setShapes] = useState([]);
    const [boardDimension, setBoardDimension] = useState(null);
    const [tool, setTool] = useState('line');
    const [color, setColor] = useState('#ffffff');

    const whiteboardContRef = useRef(null);
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        const id = Date.now() + Math.random().toString(36).substring(2, 9);

        if(tool === 'line') {
            const newLine = {
                id,
                type: 'line',
                points: [pos.x, pos.y],
                fill: color,
                color,
                strokeWidth: 3
            }
            setShapes([...shapes, newLine]);
        } else if(tool === 'rect') {
            const newRect = {
                id,
                type: 'rect',
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                color,
            }
            setShapes([...shapes, newRect]);
        } else if(tool === 'circle') {
            const newCircle = {
                id,
                type: 'circle',
                x: pos.x,
                y: pos.y,
                radius: 0,
                color,
            }
            setShapes([...shapes, newCircle]);
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
            }
            setShapes([...shapes, newText]);
            isDrawing.current = false;
        }
    }

    const handleMouseMove = (e) => {
        if(!isDrawing.current || tool === 'text') return;

        const pos = e.target.getStage().getPointerPosition();
        const updatedShapes = [...shapes];
        const targetShape = updatedShapes[updatedShapes.length - 1];
        
        if(!targetShape) return;

        if(targetShape.type === 'line' && tool === 'line') {
            targetShape.points = targetShape.points.concat([pos.x, pos.y]);
        } else if(targetShape.type === 'rect' && tool === 'rect') {
            targetShape.width = pos.x - targetShape.x;
            targetShape.height = pos.y - targetShape.y;
        } else if (targetShape.type === 'circle' && tool === 'circle') {
            const distX = pos.x - targetShape.x;
            const distY = pos.y - targetShape.y;
            targetShape.radius = Math.sqrt(distX * distX + distY * distY);
        }

        setShapes(updatedShapes);
    }

    useEffect(() => {
        if(!whiteboardContRef) return;
        setBoardDimension({
            width: whiteboardContRef.current.clientWidth - 20,
            height: whiteboardContRef.current.clientHeight
        });
    }, [leftWidth]);

    return (
        <div className="whiteboardCont" ref={whiteboardContRef}>
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
            {whiteboardContRef.current && 
                <Stage 
                    width={boardDimension.width} 
                    height={boardDimension.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => {isDrawing.current = false}}
                    // onMouseLeave={() => {isDrawing.current = false}}
                >
                    <Layer>
                        {
                            shapes.map(shape => {
                                if(shape.type === 'line') {
                                    return <Line 
                                        key={shape.id}
                                        points={shape.points}
                                        stroke={shape.color}
                                        strokeWidth={shape.strokeWidth}
                                        tension={0.5}
                                        lineCap="round"
                                        lineJoin="round"
                                    />
                                } else if(shape.type === 'rect') {
                                    return <Rect 
                                        key={shape.id}
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.width}
                                        height={shape.height}
                                        stroke={shape.color}
                                        strokeWidth={3}
                                    />
                                } else if(shape.type === 'circle') {
                                    return <Circle 
                                        key={shape.id}
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.width}
                                        height={shape.height}
                                        radius={shape.radius}
                                        stroke={shape.color}
                                    />
                                } else if(shape.type === 'text') {
                                    return <Text 
                                        key={shape.id}
                                        x={shape.x}
                                        y={shape.y}
                                        text={shape.text}
                                        fill={shape.color}
                                        fontSize={20}
                                    />
                                }
                                return null;
                            })
                        }
                    </Layer>
                </Stage>
            }
        </div>
    )
}

export default Whiteboard;