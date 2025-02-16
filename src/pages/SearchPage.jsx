import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [setDogIds] = useState([]);
  const [breedFilter, setBreedFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dogData, setDogData] = useState(null);
  const [dogDisplay, setDogDisplay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [breeds, setBreeds] = useState([]);
  const [breedSearch, setBreedSearch] = useState([]);
  const [citySearch, setCitySearch] = useState([]);
  const [stateSearch, setStateSearch] = useState([]);
  const [geoSearch, setGeoSearch] = useState([]);
  const [zipData, setZipData] = useState([]);
  const navigate = useNavigate();
  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://frontend-take-home-service.fetch.com/dogs/search", {
        params: {
          breeds: breedFilter.length ? breedFilter : undefined,
          sort: `breed:${sortOrder}`,
          ageMin: 3,
          ageMax: 10,
          size: 5,
          from: (currentPage - 1) * 5,
        },
        withCredentials: true
      });

      const fetchedDogIds = response.data.resultIds;
      setTotalPages(Math.ceil(response.data.total / 5));
      setDogIds(fetchedDogIds);
      setDogData(response.data);
      const dogResponse = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs",
        fetchedDogIds,
        { withCredentials: true }
      );
      let zipCodes = dogResponse.data.map(dog => dog.zip_code);
      console.log(zipCodes, zipData);
      const temp = zipCodes.filter(item1 =>
        zipData.some(item2 => item2 === item1)
      );
      console.log(temp);

      const dogLocation = await axios.post(
        "https://frontend-take-home-service.fetch.com/locations",
        zipCodes,
        { withCredentials: true }
      );
      const locationMap = new Map(dogLocation.data.map(location => [location.zip_code, location]));
      const mergedDogs = dogResponse.data.map(dog => ({
        ...dog,
        location: locationMap.get(dog.zip_code) || null
      }));

      setDogDisplay(mergedDogs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      alert("Error fetching dogs.");
    }
  }, [breedFilter, sortOrder, currentPage, zipData]);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get("https://frontend-take-home-service.fetch.com/dogs/breeds", {
          withCredentials: true,
        });
        setBreeds(response.data);
      } catch (error) {
        console.error("Error fetching breeds:", error);
      }
    };
    fetchBreeds();
  }, []);

  const searchBreed = (str) => {
    setBreedFilter(breeds.filter(item => item.toLowerCase().includes(str.toLowerCase())));
  }

  const handleLogOut = async () => {
    try {
      await axios.post("https://frontend-take-home-service.fetch.com/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };
  const searchLocation = async (str) => {
    try {
      const matchData = await axios.post(
        "https://frontend-take-home-service.fetch.com/locations/search",
        str,
        { withCredentials: true }
      );
      setZipData(matchData.data.results.map(loc => loc.zip_code))
      console.log(zipData)

    } catch (error) {
      console.error("Error generating match:", error);
      alert("Error generating match.");
    }
  }

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const generateMatch = async () => {
    try {
      const matchData = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        favorites,
        { withCredentials: true }
      );
      const id = matchData.data.match;
      const matchDog = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs",
        [id],
        { withCredentials: true }
      );
      navigate("/match", { state: { matchData: matchDog.data[0] } });
    } catch (error) {
      console.error("Error generating match:", error);
      alert("Error generating match.");
    }
  };

  const goToNextPage = async () => {
    await axios.get(`https://frontend-take-home-service.fetch.com${dogData.next}`, { withCredentials: true });
    setCurrentPage(currentPage + 1);
  };



  const goToPreviousPage = async () => {
    await axios.get(`https://frontend-take-home-service.fetch.com${dogData.prev}`, { withCredentials: true });
    setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Search for Dogs</h2>
      <input
        type="text"
        placeholder="Filter by Breed"
        value={breedSearch}
        onChange={
          (e) => {
            setBreedSearch(e.target.value)
            searchBreed(e.target.value)
          }
        }
        className="border p-2 m-2"
      />
      <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="bg-gray-300 p-2">
        Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
      </button>
      <input
        type="text"
        placeholder="Filter by City"
        value={citySearch}
        onChange={
          (e) => {
            setCitySearch(e.target.value)
            searchLocation({ city: e.target.value })
          }
        }
        className="border p-2 m-2"
      />
      <input
        type="text"
        placeholder="Filter by State"
        value={stateSearch}
        onChange={
          (e) => {
            setStateSearch(e.target.value)
            searchLocation({ city: e.target.value })
          }
        }
        className="border p-2 m-2"
      />
      <input
        type="text"
        placeholder="Filter by Geo"
        value={geoSearch}
        onChange={
          (e) => {
            setGeoSearch(e.target.value)
            searchLocation({ city: e.target.value })
          }
        }
        className="border p-2 m-2"
      />
      <button onClick={() => handleLogOut()} className="bg-green-500 text-white px-4 py-2 mt-4">
        Log Out
      </button>

      <ul className="mt-4">
        {loading ? (
          <li className="text-center">Loading dogs...</li>
        ) :
          dogDisplay?.map((dog) => (
            <li key={dog.id} className="border p-2 my-2 flex justify-between">
              <div>
                <p>ID: {dog.id}</p>
                <h3 className="font-bold">Breed: {dog.breed}</h3>
                <span>Age: {dog.age}</span>&nbsp;
                <span>Name: {dog.name}</span>&nbsp;
                <p>City: {dog.location.city}</p>
                <span>County: {dog.location.county}</span>&nbsp;
                <span>Lat: {dog.location.latitude}</span>&nbsp;
                <span>Long: {dog.location.longitude}</span>&nbsp;
                <span>State: {dog.location.state}</span>
                <img style={{ width: '100px', height: '100px' }} src={dog.img} alt="dog" />
              </div>
              <button onClick={() => toggleFavorite(dog.id)} className="bg-yellow-400 px-2 py-1">
                {favorites.includes(dog.id) ? "Unfavorite" : "Favorite"}
              </button>
            </li>
          ))}
      </ul>

      <div className="flex justify-between mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Previous
        </button>
        <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Next
        </button>
      </div>

      <button onClick={() => generateMatch()} className="bg-green-500 text-white px-4 py-2 mt-4">
        Generate Match
      </button>
    </div>
  );
};

export default SearchPage;
