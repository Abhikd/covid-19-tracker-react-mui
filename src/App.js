import { FormControl, Select, MenuItem , Card, CardContent } from '@material-ui/core';
import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCenter, setMapCenter]  = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapCountries, setMapCountries] = useState([]);


  useEffect(() => {
    fetch ("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, []);

  useEffect(() =>{
    
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
      });
    };
    getCountriesData();
  }, []); 

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
          setCountry(countryCode);
          setCountryInfo(data);
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
      })

  };


  return (
    <div className="app">
      <div className='app__left'>
      <div className='app__header'>
    <h1>COVID-19 TRACKER</h1>
     <FormControl className='app__dropdown'>
      <Select variant="outlined" value={country} onChange={onCountryChange}>
        <MenuItem value="worldwide">Worldwide</MenuItem>
        {
          countries.map((country) => (
            <MenuItem value={country.value}>{country.name}</MenuItem>
          ))
        }
          
      </Select>
     </FormControl>
    </div>

    <div className='app__stats'>
        <InfoBox onClick={ e => setCasesType('cases')} title="Coronavirus Cases" total={prettyPrintStat(countryInfo.cases)} cases={prettyPrintStat(countryInfo.todayCases)} />
        <InfoBox onClick={ e => setCasesType('recovered')} title="Recovered" total={prettyPrintStat(countryInfo.recovered)} cases={prettyPrintStat(countryInfo.todayRecovered)} />
        <InfoBox onClick={ e => setCasesType('deaths')} title="Deaths" total={prettyPrintStat(countryInfo.deaths)} cases={prettyPrintStat(countryInfo.todayDeaths)} />
    </div>

    <Map casesType={casesType} center={mapCenter} zoom={mapZoom} countries={mapCountries} />
      </div>

      <div className='app__right'>
        <Card>
          <CardContent>
            <h1>Live Cases by Country</h1>
            <Table countries={tableData} />
            <LineGraph casesType={casesType} />
          </CardContent>
        </Card>
      </div>
  
    </div>
  );
}

export default App;
