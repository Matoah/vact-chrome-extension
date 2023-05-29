import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

import { useSelector } from '../store';
import { getComponentDatas } from '../utils/RPCUtils';
import VariableDisplayTable from './VariableDisplayTable';

interface ComponentDataPortalProps{
}

function ComponentVariablePortal(props: { data: {} | null }){
    const { data } = props;
    //@ts-ignore
    const inputs = data ? data["变量"] : null;
    return <VariableDisplayTable variables={inputs} prefix='构件变量'></VariableDisplayTable>
}

function ComponentConstantPortal(props: { data: {} | null }){
    const { data } = props;
    //@ts-ignore
    const inputs = data ? data["常量"] : null;
    return <VariableDisplayTable variables={inputs} prefix='构件常量'></VariableDisplayTable>
}

export default function ComponentDataPortal(props:ComponentDataPortalProps){
    const { selectNode } = useSelector((state) => state.frontendDataPortal);
    const nav = useNavigate();
    const errHandler = (e: any) => {
      console.error(e);
      nav("/500");
    };
    const [data, setData] = useState<{} | null>(null);
    useEffect(() => {
      if (selectNode) {
        getComponentDatas(selectNode.id)
          .then((data) => {
            setData(data);
          })
          .catch(errHandler);
      } else {
        setData(null);
      }
    }, [selectNode]);
    return (
        <Fragment>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>构件变量</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ComponentVariablePortal data={data}></ComponentVariablePortal>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>构件常量</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ComponentConstantPortal data={data}></ComponentConstantPortal>
            </AccordionDetails>
          </Accordion>
        </Fragment>
      );
}