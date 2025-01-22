import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Search.css'; // Optional for styling

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>Search Results</h1>
      <p>Showing results for: <strong>{query}</strong></p>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="search-results">
          {results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li key={item._id}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
