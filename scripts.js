const ipAddres = document.querySelector("#ip");
const visitorLocation = document.querySelector("#location");
const timeZone = document.querySelector("#timezone");
const visitorIsp = document.querySelector("#isp");
const input = document.querySelector("#input");
const sendButton = document.querySelector("#send-button");
const errorBox = document.querySelector('#error-box');


let map;
let currentMarker;

const API_KEY = "at_jO89P85rZcHPSpgNtYPTAbbzDqvG3";


const getDefaultLocation = () => {
  // get user current location
  fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      ipAddres.innerText = `${data.ip}`;
      visitorLocation.innerText = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
      timeZone.innerText = `UTC ${data.location.timezone}`;
      visitorIsp.innerText = `${data.isp}`;

      const lat = `${data.location.lat}`;
      const lng = `${data.location.lng}`;
      displayOnMap(lat, lng);
    })
    .catch((error) => {
      console.log(error);
    });
};
getDefaultLocation();


// triggers an event to fetch the location for inputed ip address or domain
sendButton.addEventListener("click", (e) => validateInput());

const validateInput = (e) => {
  let query = input.value.trim();
  let url;

  const isValidIPAddress = (input) => {
    // Regular expression to check if the input is a valid IPv4 address
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // Regular expression to check if the input is a valid IPv6 address
    const ipv6Regex =
      /(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:))|(::([0-9a-fA-F]{1,4}:){0,5}([0-9a-fA-F]{1,4}|:))/;

    // Check if the input is IPv4 or IPv6
    if (ipv4Regex.test(input)) {
      return "IPv4";
    } else if (ipv6Regex.test(input)) {
      return "IPv6";
    } else {
      return false; // Not a valid IP address
    }
  };

  const isValidDomain = (input) => {
    // Regular expression to check if the input is a valid domain name
    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)?[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return domainRegex.test(input);
  };

  const checkUserInput = (input) => {
    // Step 1: Check if input is a valid Ip address
    const ipAddressType = isValidIPAddress(input);

    if (ipAddressType) {
      const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=${query}`;
      fetchLocation(url);
      // Proceed to use Geopify API for IP   geolocation
    }
    // Step 2: If not IP, check if it's a domain
    else if (isValidDomain(input)) {
     
      const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&domain=${query}`;
      fetchLocation(url);
     
    }
    // step 3: Handle empty request
    else if (input == "") {
      
      errorBox.style.display = 'flex';
      errorBox.textContent = 'Input field is empty.';
      
      setTimeout(() => {
        errorBox.style.display = 'none';
      }, 1500);
      
    }
    // Step 4: Handle any other string input
    else {
     
      errorBox.style.display = 'flex';
      errorBox.textContent = `Input is neither a valid IP nor a domain.
      Tip: make sure to remove https:// when inputting a domain.`;
     
     setTimeout(() => {
        errorBox.style.display = 'none';
      }, 5000);
      
    }
  };

  checkUserInput(query);
};

const fetchLocation = (urlType) => {
 
  errorBox.style.display = 'flex';
  errorBox.style.borderBottom = '0.1rem solid green';
  errorBox.textContent = `Processing your request...`;
     
  setTimeout(() => {
    errorBox.style.borderBottom = '0.1rem solid red';
    errorBox.style.display = 'none';
  }, 1000);

  fetch(urlType)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      ipAddres.innerText = `${data.ip}`;
      visitorLocation.innerText = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
      timeZone.innerText = `UTC ${data.location.timezone}`;
      visitorIsp.innerText = `${data.isp}`;

      const cLat = `${data.location.lat}`;
      const cLng = `${data.location.lng}`;
      displayOnMap(cLat, cLng);
    })
    .catch((error) => {
      console.log(error);
    });
};

const displayOnMap = (userLat, userLon) => {
  const latitude = parseFloat(userLat);
  const longitude = parseFloat(userLon);

  if (!map) {
    // Initialize the map
    map = L.map("map", {
      zoom: 13,
      zoomControl: false,
      touchZoom: true,
    }).setView([latitude, longitude]);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create a custom icon
    const myIcon = L.icon({
      iconUrl: "./images/icon-location.svg",
      iconSize: [42, 48], // Adjusted size
      iconAnchor: [21, 48], // Anchor the icon correctly
    });

    // Add the marker to the map
    currentMarker = L.marker([latitude, longitude], { icon: myIcon }).addTo(
      map
    );
  } else {
    // Update the map view
    map.setView([latitude, longitude]);

    // Move the existing marker to the new location
    if (currentMarker) {
      currentMarker.setLatLng([latitude, longitude]);
    } else {
      // If for some reason the marker doesn't exist, create it
      const myIcon = L.icon({
        iconUrl: "./images/icon-location.svg",
        iconSize: [42, 48],
        iconAnchor: [21, 48],
      });
      currentMarker = L.marker([latitude, longitude], { icon: myIcon }).addTo(
        map
      );
    }
  }

  // Ensure the map resizes properly after updates
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
};
