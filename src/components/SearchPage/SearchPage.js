import { useLocation } from "react-router-dom"
import { Card } from "../Card/Card";

export function SearchPage() {
 const data = useLocation();
 const  searchResult  = data.state.search

  return(
    <div className="search-section">
      <h4>Users found: </h4>
      {searchResult.map((user, index) => {
          return  <Card user={user} key={index} />
      })}
    </div>
  )
}