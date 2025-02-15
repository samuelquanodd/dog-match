import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const MatchPage = () => {
  const location = useLocation();
  const [dogLoc, setDogLoc] = useState(null);
  const [matchData, setMatchData] = useState(location.state?.matchData);

  useEffect(() => {
    if (!matchData || !matchData.zip_code) return;
    const dogLocation = async () => {
      try {
        const response = await axios.post(
          "https://frontend-take-home-service.fetch.com/locations",
          [matchData.zip_code],
          { withCredentials: true }
        );
        setDogLoc(response.data); 
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    dogLocation();
  }, [matchData?.zip_code]);
  useEffect(() => {
    if (dogLoc) {
      setMatchData(prevData => ({
        ...prevData,
        location: dogLoc 
      }));
    }
  }, [dogLoc]); 


  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Your Match</h2>
      {matchData ? (
        <div className="border p-4 mt-4">
          <p>ID: {matchData.id}</p>
          <h3 className="font-bold">Breed: {matchData.breed}</h3>
          <p>Age: {matchData.age}</p>
          <p>Name: {matchData.name}</p>
          <p>Zip Code: {matchData.zip_code}</p>
          {matchData.location && (
            <div>
              <p>City: {matchData.location[0]?.city}</p>
              <span>County: {matchData.location[0]?.county}</span>&nbsp;
              <span>Lat: {matchData.location[0]?.latitude}</span>&nbsp;
              <span>Long: {matchData.location[0]?.longitude}</span>&nbsp;
              <span>State: {matchData.location[0]?.state}</span>
            </div>
          )}
          <img style={{ width: '100px', height: '100px' }} src={matchData.img} alt="dog" />
        </div>
      ) : (
        <p>No match found.</p>
      )}
    </div>
  );
};

export default MatchPage;
