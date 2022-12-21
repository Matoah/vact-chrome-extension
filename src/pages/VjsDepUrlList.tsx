import VjsUrlList from "../components/VjsUrlList";
import { useNavigate } from "react-router-dom";

function VjsDepUrlList() {
  const nav = useNavigate();
  return (
    <VjsUrlList
      click={(id: string) => {
        nav(`/vjsDepAnalysis/${id}`);
      }}
      tip="依赖分析"
    ></VjsUrlList>
  );
}

export default VjsDepUrlList;
