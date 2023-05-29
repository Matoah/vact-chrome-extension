import CustomTable, { Columns } from './CustomTable';

interface DatasourceTableProps {
  data: {
    datas: {
      values: Array<{ [fieldCode: string]: any }>;
    };
    metadata: {
      model: Array<{
        fields: Array<{
          code: string;
          name: string;
        }>;
      }>;
    };
  };
}

export default function DatasourceTable(props: DatasourceTableProps) {
  const { data } = props;
  const fields = data?.metadata?.model?.[0]?.fields;
  let columns:Columns = [];
  if (fields) {
    //@ts-ignore
    fields.forEach((field) => {
      //@ts-ignore
      columns.push({
        code: field.code,
        title: field.name ? field.name : field.code
      });
    });
  }
  //@ts-ignore
  let datas:any = [];
  const entiyDatas = data?.datas?.values;
  if (entiyDatas) {
    datas = entiyDatas;
  }
  //id列放在最前面
  columns = columns.sort(({code:c1}, {code:c2})=>{
    return c1=="id" ? -1:(c2=="id" ? 1:c1.localeCompare(c2))
  });
  return <CustomTable columns={columns} datas={datas}></CustomTable>;
}
