import React, { ReactNode, useEffect } from "react";

import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const StyledButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

function OperationButton(props: {
  active: boolean;
  title: string;
  disabled: boolean;
  icon: ReactNode;
  shortcut?: (evt: KeyboardEvent) => boolean;
  onClick?: (active: boolean) => void;
}) {
  const { active, title, icon, disabled, onClick, shortcut } = props;
  const chickHandler = () => {
    if (onClick && !disabled) {
      onClick(!active);
    }
  };
  let shortcutHandler = (evt: KeyboardEvent) => {};
  if (shortcut) {
    shortcutHandler = (evt: KeyboardEvent) => {
      if (shortcut(evt)) {
        chickHandler();
      }
    };
  }
  useEffect(() => {
    window.document.addEventListener("keyup", shortcutHandler);
    return () => {
      window.document.removeEventListener("keyup", shortcutHandler);
    };
  }, [active, disabled]);
  return disabled ? (
    <IconButton disabled={disabled} onClick={chickHandler}>
      {icon}
    </IconButton>
  ) : (
    <Tooltip title={title} enterDelay={1000}>
      {active ? (
        <StyledButton disabled={disabled} onClick={chickHandler}>
          {icon}
        </StyledButton>
      ) : (
        <IconButton disabled={disabled} onClick={chickHandler}>
          {icon}
        </IconButton>
      )}
    </Tooltip>
  );
}

export default OperationButton;
