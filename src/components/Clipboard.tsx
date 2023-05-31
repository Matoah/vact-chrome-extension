import {
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import copy from 'copy-to-clipboard';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import Modal from '@mui/material/Modal';

interface ClipboardProps {
  label: string|ReactNode;
  value: any;
}

const resolveChar = function (value: any) {
  if (typeof value == "string") {
    return JSON.stringify(value);
  }
  return value;
};

type TipType = "success" | "error";

interface TipsProps {
  duration?: number;
  message: string;
  type: TipType;
  onHide: () => void;
}

function Tips(params: TipsProps) {
  const { duration, message, type, onHide } = params;
  const [open, setOpen] = useState(true);
  const hide = () => setOpen(false);
  if (!message) {
    return null;
  }
  const time = duration || 1000;
  useEffect(() => {
    setTimeout(() => {
      hide();
      onHide();
    }, time);
  });
  let children: null | ReactNode = null;
  if (type == "success") {
    children = <Alert severity="success">{message}</Alert>;
  } else if (type == "error") {
    children = <Alert severity="error">{message}</Alert>;
  }
  return (
    <Modal open={open} onClose={hide}>
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {children}
      </Box>
    </Modal>
  );
}

function Clipboard(params: ClipboardProps) {
  const { value: orginalValue,label } = params;
  const value = resolveChar(orginalValue);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [tips, setTips] = useState<null | { type: TipType; message: string }>(
    null
  );
  const showContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };
  const hideContextMenu = () => {
    setContextMenu(null);
  };
  const menus = [
    {
      code: "copy",
      label: "复制值",
      handler: () => {
        const isSuccess = copy(typeof value=='string' ? value:JSON.stringify(value));
        if (isSuccess) {
          setTips({
            type: "success",
            message: "已复制",
          });
        } else {
          setTips({
            type: "error",
            message: "复制失败，请重试！",
          });
        }
      },
    },
  ];
  if (typeof orginalValue == "string") {
    menus.push({
      code: "copyOrginal",
      label: "复制字符串内容",
      handler: () => {
        const isSuccess = copy(orginalValue);
        if (isSuccess) {
          setTips({
            type: "success",
            message: "已复制",
          });
        } else {
          setTips({
            type: "error",
            message: "复制失败，请重试！",
          });
        }
      },
    });
  }
  return (
    <Fragment>
      <span onContextMenu={showContextMenu}>{label}</span>
      <Menu
        open={contextMenu !== null}
        onClose={hideContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {menus.map((menu) => {
          return (
            <MenuItem
              key={menu.code}
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                menu.handler();
                hideContextMenu();
              }}
            >
              {menu.label}
            </MenuItem>
          );
        })}
      </Menu>
      {tips == null ? null : (
        <Tips
          message={tips.message}
          type={tips.type}
          onHide={() => setTips(null)}
        ></Tips>
      )}
    </Fragment>
  );
}

export default Clipboard;
