import axios from 'axios';
export default function YTSearch (params) {
    const SEARCH_ROOT = 'https://www.googleapis.com/youtube/v3/search';
    const VIDEOS_ROOT = 'https://www.googleapis.com/youtube/v3/videos';
    //get search results
    return new Promise((resolve,reject) => {
        axios.get(SEARCH_ROOT, {params})
        .then((response)=>{
        let ids = response.data.items.map(item => item.id.videoId);      
        ids = ids.toString();
        //get likes and video length and append to response
        axios.get(VIDEOS_ROOT, {params: {part: 'contentDetails, statistics', key: params.key, id: ids}})
        .then((contentResponse)=> {
            const allItems = response.data.items.map((item)=> {        
            contentResponse.data.items.forEach((contentItem)=> {
                if (item.id.videoId === contentItem.id) {
                item.contentDetails = contentItem.contentDetails;
                item.statistics = contentItem.statistics;
                };            
            })
            return item;
            }); 
            resolve(allItems);
        }).catch((e)=> {
            reject(e);
        })
        }).catch((e)=> {
        reject(e);    
        });
    });
}