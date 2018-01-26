/* import axios from 'axios';

const ROOT_URL = 'https://accounts.spotify.com/api/token';


export default function (options, callback) {
    const authorization = 'Basic ' + new Buffer(options.clientID + ':' + options.clientSecret).toString('base64');

    axios.defaults.withCredentials = true;
    axios.defaults.crossDomain = true;

    axios.post(ROOT_URL, {
        'grant_type': 'client_credentials'
    }, {
        headers: {
            'Authorization': authorization
        }
    })
    .then(response => {
        callback(response);
    })
    .catch(error => {
        throw new Error(error);
    })
} */
export default function fetchToken(callback) {
    var url = 'https://script.google.com/macros/s/AKfycbyP2Bj6CatiqmAVm02e2iEizeLM6-hNrKv6sLeaRfvBGPFwD5Wd/exec';
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}