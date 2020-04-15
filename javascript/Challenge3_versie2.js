// Set api token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2lza2F6IiwiYSI6ImNrOHI4N2ZmZDA0bWkzbHMwbnNsdXl1N2gifQ.lKP1Qd-Rq5LUsrr8fHFiNw';


// api token for openWeatherMap
var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather';
var openWeatherMapUrlApiKey = '50ec899ce0345e78e8719cdd82f9ccb3';

var popup;
var lastLoc;

// Initialate map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ciskaz/ck8vnsyi323zq1irlzadxp57c',                        //doet het niet
  center: [4.322840, 52.067101],                                                    //startlocatie, voordat je een plaats intypt
  zoom: 9,
    pitch: 90,
    bearing: 25
});

map.on('moveend', function () {
    var plaats = document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].value;
    plaats = plaats.substring(0, plaats.indexOf(','));
     if (plaats != lastLoc) {
        console.log(plaats);
        // construct request
        var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&' + 'q=' + plaats;

        // get current weather
        fetch(request)
        // parse to JSON format
        .then(function(response) {
            if(!response.ok) throw Error(response.statusText);
            console.log(response);
            return response.json();
        })

        // render weather per day
        .then(function(response) {
            // render weatherCondition
            onAPISucces(response, plaats);	
        })

    //	 catch error
        .catch(function (error) {
            onAPIError(error);
	    })
        lastLoc = plaats;
    };    
});

function onAPISucces(response, plaats) {
    var lon = response.coord.lon;
    var lat = response.coord.lat;

    var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&lon=' + lon + '&lat=' + lat;

    var city = {
        name: plaats,
        coordinates: [lon, lat]
        };
    
    // Get current weather based on cities' coordinates
    fetch(request)
      .then(function(response) {
        if(!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(function(response) {
        // Then plot the weather response + icon on MapBox
        plotImageOnMap(response.weather[0].icon, city)
      })
      .catch(function (error) {
        console.log('ERROR:', error);
      });
    
    //Remove old popup if it exists
    if (popup != null){
       popup.remove();
    }
    popup = new mapboxgl.Popup()
        .setLngLat([lon, lat+0.01]);
    
    //Als het regent of windkracht 5 of hoger, kunnen we niet landen
    if (response.weather[0].main == "Rain" || response.wind.speed > 8){
        popup.setHTML('<img id="astronaut" src="afbeeldingen/astronaut_rood.png" />');
    } else {
        popup.setHTML('<img id="astronaut" src="afbeeldingen/astronaut_groen.png" />');
    }
    
    popup.addTo(map);
}


function onAPIError(error) {
	console.error('Fetch request failed', error);
	var weatherBox = document.getElementById('weather');
	weatherBox.innerHTML = 'No weather data available <br /> Did you enter a valid city?'; 
}

function plotImageOnMap(icon, city) {
  map.loadImage(
    'https://openweathermap.org/img/w/' + icon + '.png',
    function (error, image) {
      if (error) throw error;
      map.addImage("weatherIcon_" + city.name, image);
      map.addSource("point_" + city.name, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: city.coordinates
            }
          }]
        }
      });
      map.addLayer({
        id: "points_" + city.name,
        type: "symbol",
        source: "point_" + city.name,
        layout: {
          "icon-image": "weatherIcon_" + city.name,
          "icon-size": 1.7
        }
      });
    }
  );
}



// Voeg de zoekbalk toe
// twee attributen: control en waar zoekbalk staat
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  }),
  'top-right'   //top/bottom en left/right
);

map.addControl(new mapboxgl.NavigationControl()); 





