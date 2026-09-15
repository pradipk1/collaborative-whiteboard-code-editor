import { useEffect, useRef, useState } from "react";
import {Stage, Layer, Line, Rect, Text, Circle} from 'react-konva';
import './whiteboard.css';

function Whiteboard({leftWidth}) {
    const [shapes, setShapes] = useState([]);
    const whiteboardContRef = useRef(null);
    const [boardDimension, setBoardDimension] = useState(null);

    useEffect(() => {
        if(!whiteboardContRef) return;
        setBoardDimension({
            width: whiteboardContRef.current.clientWidth,
            height: whiteboardContRef.current.clientHeight
        });
    }, [leftWidth]);

    return (
        <div className="whiteboardCont" ref={whiteboardContRef}>
            {whiteboardContRef.current && 
                <Stage width={boardDimension.width} height={boardDimension.height}>
                    <Layer>
                        <Text text="Try to drag shapes" fontSize={15}/>
                        <Rect 
                            x={20}
                            y={20}
                            width={100}
                            height={100}
                            fill='red'
                            draggable
                        />
                    </Layer>
                </Stage>
            }
        </div>
    )
}

export default Whiteboard;