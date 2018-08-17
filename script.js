function getImage(text) {
  const request = new XMLHttpRequest();
  const api_key = '';
  request.open(
    'GET',
    `https://api.flickr.com/services/rest/?method=flickr.photos.search
&api_key=${api_key}&text=${text}&format=json&nojsoncallback=1`
  );
  request.addEventListener('load', event => {
    if (event.target.status !== 200) {
      console.log(`Error: ${event.target.status}`);
      return;
    }
    console.log(event.target.status);
    console.log(event.target.response);
    const obj = JSON.parse(event.target.response);
    const view = createView(obj);
    displayView(view);
  });
  request.addEventListener('error', () => {
    console.error('Network Error');
  });
  request.send();
}
function createView(obj) {
  const view = document.createElement('div');
  obj.photos.photo.forEach((v, i, a) => {
    const farm_id = v.farm;

			
const server_id = v.server;

			
const id = v.id;

			
const secret = v.secret;

			
const title = v.title;
    const imageURL = `https://farm${farm_id}.staticflickr.com/${server_id}/${id}_${secret}_m.jpg`;
    const htmlString = `<a href="${imageURL}"><img src="${imageURL}" alt="${title}"></a>`;
    view.insertAdjacentHTML('beforeend', htmlString);
  });
  return view;
}
function displayView(view) {
  const result = document.getElementById('result');
  result.innerHTML = '';
  result.appendChild(view);
}

const searchForm = document.getElementById('search');
const input = document.getElementById('input');
searchForm.onsubmit = () => {
  const inputText = input.value;
  if (!inputText) return false;
  getImage(inputText);
  return false;
};
/*
https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

farm: 2;
id: '43375040644';
isfamily: 0;
isfriend: 0;
ispublic: 1;
owner: '143290162@N03';
secret: '14c5f7b673';
server: '1775';
title: 'The 67 Best Street Style Looks We’ve Seen All Summer';
__proto__: Object;
*/
