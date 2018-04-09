import axios from "axios";
const ROOT_URL = "https://www.googleapis.com/youtube/v3/";

const YTApi = {
  search: params => {
    //get search results
    return new Promise((resolve, reject) => {
      axios
        .get(ROOT_URL + "search", { params })
        .then(response => {
          const ids = response.data.items
            .map(item => item.id.videoId)
            .toString();

          //get  video length and append to response
          axios
            .get(ROOT_URL + "videos", {
              params: { part: "contentDetails", key: params.key, id: ids }
            })
            .then(contentResponse => {
              contentResponse.data.items.forEach((contentItem, i) => {
                response.data.items[i].contentDetails =
                  contentItem.contentDetails;
              });

              resolve(response.data.items);
            })
            .catch(e => {
              reject(e);
            });
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  playlistItems: params => {
    let playlistItems = [];

    return new Promise((resolve, reject) => {
      axios
        .get(ROOT_URL + "playlists", { params })
        .then(response => {
          const getPlaylistItems = (nextPageToken, callback) => {
            axios
              .get(ROOT_URL + "playlistItems", {
                params: {
                  part: "snippet",
                  key: params.key,
                  playlistId: params.id,
                  maxResults: 50,
                  pageToken: nextPageToken
                }
              })
              .then(playlistItemsResponse => {
                const ids = playlistItemsResponse.data.items
                  .map(item => item.snippet.resourceId.videoId)
                  .toString();

                axios //get  video length and append to response
                  .get(ROOT_URL + "videos", {
                    params: {
                      part: "contentDetails",
                      key: params.key,
                      id: ids
                    }
                  })
                  .then(contentResponse => {
                    contentResponse.data.items.forEach((contentItem, i) => {
                      playlistItemsResponse.data.items[i].contentDetails =
                        contentItem.contentDetails;
                    });

                    callback(playlistItemsResponse);
                  })
                  .catch(e => {
                    reject(e);
                  });
              })
              .catch(e => {
                reject(e);
              });
          };

          const getNext = nextResponse => {
            playlistItems = [...playlistItems, ...nextResponse.data.items];

            if (nextResponse.data.nextPageToken) {
              getPlaylistItems(nextResponse.data.nextPageToken, getNext);
            } else {
              response.data.items[0].playlistItems = playlistItems;
              resolve(response.data.items[0]);
            }
          };

          getPlaylistItems(null, getNext);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  videos: params => {
    return new Promise((resolve, reject) => {
      axios
        .get(ROOT_URL + "videos", { params })
        .then(response => {
          resolve(response.data.items);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  videosGapi: params => {
    return new Promise((resolve, reject) => {
      window.gapi.client.youtube.videos
        .list(params)
        .then(response => {
          resolve(response.result);
        })
        .catch(e => {
          reject(e);
        });
    });
  }
};

export default YTApi;
