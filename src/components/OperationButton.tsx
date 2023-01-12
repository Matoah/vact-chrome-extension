import { ReactNode } from 'react';

import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

const StyledButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

function OperationButton(props: {
  active: boolean;
  title: string;
  disabled: boolean;
  icon: ReactNode;
  onClick?: (active: boolean) => void;
}) {
  const { active, title, icon, disabled, onClick } = props;
  const chickHandler = () => {
    if (onClick) {
      onClick(!active);
    }
  };
  return active && !disabled ? (
    <Tooltip title={title}>
      <StyledButton disabled={disabled} onClick={chickHandler}>
        {icon}
      </StyledButton>
    </Tooltip>
  ) : (
    <IconButton disabled={disabled} onClick={chickHandler}>
      {icon}
    </IconButton>
  );
}

export default OperationButton;
