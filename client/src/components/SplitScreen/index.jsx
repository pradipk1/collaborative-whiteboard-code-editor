
import Whiteboard from './../Whiteboard';
import CodeEditor from './../CodeEditor';
import './splitScreen.css';
import { useEffect, useRef, useState } from 'react';

function SplitScreen() {
    const [leftWidth, setLeftWidth] = useState(50);
    const isDragging = useRef(false);
    const splitScreenContRef = useRef(null);
    console.log('the component re-rendered!');

    const startResize = (e) => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'
    }

    useEffect(() => {

        // handle mouse move event
        const handleMouseMove = (e) => {
            if(!isDragging.current || !splitScreenContRef) return;

            const spliScreenContRect = splitScreenContRef.current.getBoundingClientRect();
            const newLeftWidthPx = e.clientX - spliScreenContRect.left;
            const newLeftWidthPercentage = (newLeftWidthPx / spliScreenContRect.width) * 100;

            // Constrain layout dimensions (min 20%, max 80%)
            if((newLeftWidthPercentage >= 20 && newLeftWidthPercentage <= 80)) {
                setLeftWidth(newLeftWidthPercentage);
            }
        }

        const handleMouseUp = () => {
            if(isDragging.current) {
                isDragging.current = false;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            }
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp)
        }
    },
    []);

    return (
        <div className="splitScreen-cont" ref={splitScreenContRef}>
            <div className="split-cont">

                {/* left split box */}
                <div className='split-left-cont' style={{width: `${leftWidth}%`}}>
                    {<Whiteboard leftWidth={leftWidth} />}
                </div>

                {/* screen divider */}
                <div className="screenDivider"
                    onMouseDown={startResize}
                    onMouseEnter={(e) => {e.target.style.backgroundColor = '#007acc'}}
                    onMouseLeave={(e) => {
                        if(!isDragging.current) e.target.style.backgroundColor = '#333';
                    }}
                ></div>

                {/* right split box */}
                <div className='split-right-cont' style={{width: `${100 - leftWidth}%`}}>
                    {<CodeEditor />}
                </div>
            </div>
        </div>
    )
}

export default SplitScreen;