import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { isDatasourceData } from '../utils/ObjectUtils';
import DatasourceTable from './DatasourceTable';

interface Column{
    code:string
    title:string
    align?:"left" | "right" | "center"
}

type Columns = Array<Column>

type Row = {id:string}& {
  [code:string]:any
}

interface CustomTableProps {
  columns: Columns;
  datas: Row[]
}

const resolveChar = function(title:any){
  if(typeof title == "string"){
    return `"${title}"`
  }
  return title;
}

export { type Columns, type Row };

export default function CustomTable(props: CustomTableProps) {
  const { columns, datas } = props;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow
            sx={{ "& th": { textTransform: "none" } }}
          >
            {
                columns.map(column=>{
                    const columnCode = column.code;
                    const align = column.align;
                    return <TableCell align={align ? align:"center"} key={columnCode}>{column.title}</TableCell>
                })
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {datas&&datas.length>0 ? datas.map((data) => (
            <TableRow
              key={data.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
                {columns.map(column=>{
                    const columnCode = column.code;
                    const value = data[columnCode];
                    return <TableCell align="center" key={columnCode}>{isDatasourceData(value) ? (<DatasourceTable data={value}></DatasourceTable>):resolveChar(value)}</TableCell>
                })}
            </TableRow>
          )):(
            <TableRow>
              <TableCell colSpan={columns.length} align='center'>无数据！</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
