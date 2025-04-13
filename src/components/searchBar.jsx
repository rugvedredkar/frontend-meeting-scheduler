import {Search} from "lucide-react";

export default function SearchBar () {

    return (
        <>
            <div className="search-bar">
            <div className="search-icon">
                <Search size={18} />
            </div>
            <input
                type="text"
                placeholder="Search for new friends"
                className="search-input"
            />
            <button className="search-button">Search</button>
            </div>
        </>
    
    )
}