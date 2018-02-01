import axios from 'axios';
export default function YTSearch (params) {
    const ROOT_URL = 'https://www.googleapis.com/youtube/v3/'
    //get search results
    return new Promise((resolve,reject) => {
        axios.get(ROOT_URL + 'search', {params})
        .then((response)=>{
        let ids = response.data.items.map(item => item.id.videoId);      
        ids = ids.toString();
        //get likes and video length and append to response
        axios.get(ROOT_URL + 'videos', {params: {part: 'contentDetails', key: params.key, id: ids}})
        .then((contentResponse)=> {
            const allItems = response.data.items.map((item)=> {        
            contentResponse.data.items.forEach((contentItem)=> {
                if (item.id.videoId === contentItem.id) {
                    item.contentDetails = contentItem.contentDetails;
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