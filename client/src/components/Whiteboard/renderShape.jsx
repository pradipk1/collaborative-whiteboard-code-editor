import {Line, Rect, Text, Circle} from 'react-konva';

function RenderShape({shape}) {
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
    return;
}

export default RenderShape;