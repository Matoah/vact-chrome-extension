import VjsUrlList from "../components/VjsUrlList";
import { useNavigate } from "react-router-dom";

function VjsDepUrlList() {
  const nav = useNavigate();
  return (
    <VjsUrlList
      click={(id: string) => {
        nav(`/vjsDepAnalysis/${id}`);
      }}
      tip="δΎθ΅εζ"
    ></VjsUrlList>
  );
}

export default VjsDepUrlList;
