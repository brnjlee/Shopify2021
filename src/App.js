import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';
import _ from "lodash";


function App() {
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState({});
  const [resultList, setResultList] = useState([]);
  const [nominationList, setNominationList] = useState([]);

  useEffect(() => {
    const getMovies =  _.debounce( async () => {
      try {
        const { data } = await axios.get(`https://www.omdbapi.com/`, {
          params: {
            apikey: process.env.REACT_APP_API_KEY,
            i: process.env.REACT_APP_IMDB_ID,
            s: input,
            type: "movie",
            r: "json"
          }
        });
        if (data.Response === "True") {
          setErrors(prevState => {
            return {...prevState, request: null}
          });
          setResultList(data.Search);
        } else {
          setErrors(prevState => {
            return {...prevState, request: data.Error}
          });
        }
      } catch (error) {
        setErrors(prevState => {
          return {...prevState, request: error}
        });
      }
    }, 500);
    
    if (!input) {
      setResultList([]);
      return;
    };
    getMovies();
  }, [input]);

  const handleNominate = (id) => {
    const selectedItem = resultList.find((item) => item.imdbID === id);
    const isSelected = !!nominationList.find((item) => item.imdbID === id);
    if(isSelected) return;
    setNominationList([...nominationList, selectedItem]);
  }

  const handleRemove = (id) => {
    const updatedList = nominationList.filter((item) => item.imdbID !== id);
    setNominationList(updatedList);
  }

  return (
    <div className="App">
      <h1>The Shoppies</h1>
      <div className="input-label">
        <label>MOVIE TITLE</label>
        {errors.request && <span className="error">{errors.request}</span>}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="content__container">
        <Results resultList={resultList} nominate={handleNominate} input={input} />
        {!!nominationList.length && <Nominations nominationList={nominationList} remove={handleRemove} />}
      </div>
    </div>
  );
}

const Results = ({ resultList, nominate, input }) => {
  const mappedResults = resultList.map((item, i) => (
    <Item key={i} id={item.imdbID} name={item.Title} onClick={(id) => nominate(id)} buttonText="Nominate" />
  ));
  return (
    <div className="results__container">
      <div className="results__header">{!resultList.length && "NO"} RESULTS {input && `FOR "${input}"`} </div>
      {mappedResults}
    </div>
  )
}

const Nominations = ({ nominationList, remove }) => {
  const mappedNominations = nominationList.map((item, i) => (
    <Item key={i} id={item.imdbID} name={item.Title} onClick={(id) => remove(id)} buttonText="Remove" />
  ));
  return (
    <div className="results__container">
      <span className="results__header">NOMINATIONS</span>
      {mappedNominations}
    </div>
  )
}

const Item = ({ id, name, onClick, buttonText }) => {
  return (
    <div className="item__container">
      {name}
      <button className="item__button" onClick={() => onClick(id)}>{buttonText}</button>
    </div>
  )
}

export default App;
