import { Fragment } from 'react';

import Typography from '@mui/material/Typography';

import CustomTable from './CustomTable';

interface VariableDisplayTableProps{
    prefix:string
    variables:{[code:string]:any}
}

export default function VariableDisplayTable(props:VariableDisplayTableProps){
    const {variables,prefix} = props;
    const datas: Array<{ id:string,code: string; value: any }> = [];
    if (variables) {
      Object.keys(variables).forEach((code) => {
        datas.push({
            id:code,
          code,
          value: variables[code],
        });
      });
    }
    return (
      <Fragment>
        {variables ? (
          <CustomTable
            columns={[{
              code:"code",
              title: `${prefix}编号`
            },{
              code:"value",
              title: `${prefix}值`
            }]}
            datas={datas}
          ></CustomTable>
        ) : (
          <Typography>没有{prefix}信息！</Typography>
        )}
      </Fragment>
    );
}