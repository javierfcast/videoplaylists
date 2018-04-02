import axios from 'axios';
const ROOT_URL = 'https://www.googleapis.com/youtube/v3/'

const YTApi = {
    Search: (params) => {
        //get search results
        return new Promise((resolve,reject) => {

            axios.get(ROOT_URL + 'search', {params})
            .then((response)=>{

                const ids = response.data.items.map(item => item.id.videoId).toString();    

                //get  video length and append to response
                axios.get(ROOT_URL + 'videos', {params: {part: 'contentDetails', key: params.key, id: ids}})
                .then((contentResponse)=> {

                    contentResponse.data.items.forEach((contentItem, i) => {
                        response.data.items[i].contentDetails = contentItem.contentDetails;
                    })
                    
                    resolve(response.data.items)
                    
                }).catch((e)=> {
                    reject(e);
                })
            }).catch((e)=> {
                reject(e);    
            });
        });
    },

    playlistItems: (params) => {
        //get playlist items
        return new Promise((resolve,reject) => {
            
            axios.get(ROOT_URL + 'playlists', {params})
            .then((response)=>{

                axios.get(ROOT_URL + 'playlistItems', {params: {part: 'snippet', key: params.key, playlistId: params.id, maxResults: 50}})
                .then((playlistItemsResponse)=> {

                    const getNext = (nextPageToken) => {

                        if (nextPageToken) {
                            axios.get(ROOT_URL + 'playlistItems', {params: {part: 'snippet', key: params.key, playlistId: params.id, maxResults: 50, pageToken: nextPageToken}})
                            .then((nextResponse) => {

                                response.data.items[0].playlistItems.items = [...response.data.items[0].playlistItems.items, ...nextResponse.data.items];
                                getNext(nextResponse.data.nextPageToken);

                            }).catch((e)=> {
                                reject(e);
                            });
                        }

                        else {
                            const ids = response.data.items[0].playlistItems.items.map(item => item.snippet.resourceId.videoId).toString();
                            
                            //get  video length and append to response
                            axios.get(ROOT_URL + 'videos', {params: {part: 'contentDetails', key: params.key, id: ids}})
                            .then((contentResponse)=> {
                                
                                contentResponse.data.items.forEach((contentItem, i) => {
                                    response.data.items[0].playlistItems.items[i].contentDetails = contentItem.contentDetails;
                                })

                                resolve(response.data.items[0]);
                                
                            }).catch((e)=> {
                                reject(e);
                            })
                        }
                    }

                    response.data.items[0].playlistItems = playlistItemsResponse.data;
                    getNext(playlistItemsResponse.data.nextPageToken);

                }).catch((e)=> {
                    reject(e);
                })
            }).catch((e)=> {
                reject(e);
            });
        });
    },

    videos: (params) => {
        return new Promise((resolve,reject) => {
            window.gapi.client.youtube.videos.list(params)
            .then(response => {
                resolve(response.result)
            }).catch((e)=> {
                reject(e);
            })
        });
    }
}

export default YTApi