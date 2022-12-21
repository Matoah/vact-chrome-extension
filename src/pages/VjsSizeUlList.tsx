import VjsUrlList from "../components/VjsUrlList";
import { useNavigate } from "react-router-dom";

function VjsSizeUlList() {
  const nav = useNavigate();
  return (
    <VjsUrlList
      click={(id: string) => {
        nav(`/vjsSizeAnalysis/${id}`);
      }}
      tip="大小分析"
    ></VjsUrlList>
  );
}

export default VjsSizeUlList;
