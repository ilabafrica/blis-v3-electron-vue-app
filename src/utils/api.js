import axios from 'axios'
const base_url =process.env.VUE_APP_API_URL

const apiCall = ({url, data, method}) => new Promise((resolve, reject) => {
  console.log(url)
  url = base_url+url
  console.log(url)
  setTimeout(() => {
    try {
      
      axios.defaults.headers.common['Authorization'] = localStorage.getItem('user-token');
      if (data == 'PDF') {
        axios({
         url: url,
         method: 'GET',
         responseType: 'blob',
       }).then((response) => {
         //create a blob from the pdf stream
         const file = new Blob([response.data], {type: 'application/pdf'});

         //build a url from the file
         const fileURL = URL.createObjectURL(file);

         //open the url on new window
         window.open(fileURL);
       }).catch((err)=>{
         console.log("Error on PDF Load is, "+ err)
       })
      } else if (method == 'GET') {
        axios.get(url, { crossdomain: true }).then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error(error))
        })
      } else if (method == 'POST'){
        axios.post(url,data).then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error(error))
        });
      } else if (method == 'PUT'){
        axios.put(url,data).then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error(error))
        });
      } else if (method == 'DELETE'){
        axios({ method: 'delete', url: url,data: null})
        .then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error(error))
        });
      }
    } catch (err) {
      reject(new Error(err))
    }
  }, 1000)
})

export default apiCall