import MoreVertIcon from '@mui/icons-material/MoreVert';

interface HResizerProps {
  onDoubleClick?: () => void;
  onMouseMove?: (evt: any) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function HResizer(props: HResizerProps) {
  const { onDoubleClick, onDragStart, onDragEnd, onMouseMove } = props;
  return (
    <div
      draggable
      onDoubleClick={() => {
        if (onDoubleClick) {
          onDoubleClick();
        }
      }}
      onMouseDown={() => {
        if (onDragStart) {
          onDragStart();
        }
      }}
      onMouseUp={() => {
        if (onDragEnd) {
          onDragEnd();
        }
      }}
      onMouseMove={(evt) => {
        if (onMouseMove) {
          onMouseMove(evt);
        }
      }}
      style={{
        width: "8px",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "e-resize",
      }}
    >
      <MoreVertIcon color="primary" />
    </div>
  );
}

export default HResizer;
