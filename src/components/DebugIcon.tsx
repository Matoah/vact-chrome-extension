import PestControlIcon from '@mui/icons-material/PestControl';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography, { TypographyProps } from '@mui/material/Typography';

function DebugIcon(props: {
  type: "rule" | "if" | "else" | "foreach";
  value: boolean;
  disabled: boolean;
  onToggle: (debuged: boolean) => void;
}) {
  const { value, onToggle, disabled, type } = props;
  const attrs: TypographyProps = {
    variant: "caption",
    color: "inherit",
    align: "center",
    sx: {
      width: "50px",
    },
  };
  const btnAttrs: IconButtonProps = {
    disabled,
    onClick: () => {
      if (type == "rule") {
        onToggle(!value);
      }
    },
  };
  if (type != "rule") {
    return <Typography {...attrs}></Typography>;
  } else {
    return (
      <IconButton {...btnAttrs}>
        <PestControlIcon
          fontSize="small"
          sx={{ cursor: "pointer" }}
          color={value ? (disabled ? "disabled" : "primary") : "inherit"}
        />
      </IconButton>
    );
  }
}

export default DebugIcon;
