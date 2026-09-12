
import Whiteboard from './../Whiteboard';
import CodeEditor from './../CodeEditor';
import './splitScreen.css';
import { useState } from 'react';

function SplitScreen() {
    const [leftWidth, setLeftWidth] = useState(50);

    return (
        <div className="splitScreen-cont">
            <div className="split-cont">

                {/* left split box */}
                <div className='split-left-cont'
                    style={{width: `${leftWidth}%`}}
                >
                    {<Whiteboard />}
                </div>

                {/* screen divider */}
                <div className="screenDivider"
                    
                ></div>

                {/* right split box */}
                <div className='split-right-cont'
                    style={{width: `${100 - leftWidth}%`}}
                >
                    {<CodeEditor />}
                </div>
            </div>
        </div>
    )
}

export default SplitScreen;