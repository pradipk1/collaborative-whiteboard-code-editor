import { useEffect, useRef, useState } from "react";


const maxWidth = 800;
// const maxHeight = 800;

function useResponsiveWidth() {
    const [width, setWidth] = useState(1);
    // const [height, setHeight] = useState(1);

    const canvasContRef = useRef(null);

    useEffect(() => {
        if(!canvasContRef.current) return;

        const updateWidthAndHeight = () => {
            setWidth(Math.max(1, Math.min(maxWidth, canvasContRef.current.clientWidth)));
            // setHeight(Math.max(1, Math.min(maxHeight, canvasCont.clientHeight)));
        }

        const observer = new ResizeObserver(updateWidthAndHeight);
        observer.observe(canvasContRef.current);

        return () => {
            observer.disconnect();
        }
    }, []);

    return {canvasContRef, width, scale: width / maxWidth};
}

export default useResponsiveWidth;