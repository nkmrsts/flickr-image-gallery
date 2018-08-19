function main() {
  const input = getSearchText();
  if (input.length === 0) {
    const view = `入力欄が空です。`;
    displayView(view);
  }
  getPhotos(input)
    .then(photos => createView(photos))
    .then(view => displayView(view))
    .catch(error => {
      console.error(`エラーが発生しました (${error})`);
    });
}
function getPhotos(text) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const api_key = '';
    request.open(
      'GET',
      `https://api.flickr.com/services/rest/?method=flickr.photos.search
&api_key=${api_key}&text=${text}&per_page=16&format=json&nojsoncallback=1`
    );
    request.addEventListener('load', event => {
      if (event.target.status !== 200) {
        console.log(`Error: ${event.target.status}`);
        reject(new Error(`${event.target.status}: ${event.target.statusText}`));
      }
      const photos = JSON.parse(event.target.response);
      resolve(photos);
    });
    request.addEventListener('error', () => {
      console.error('Network Error');
      reject(new Error('ネットワークエラー'));
    });
    request.send();
  });
}
function getSearchText() {
  const value = document.getElementById('search').value;
  return encodeURIComponent(value);
}
function createView(obj) {
  const view = [];
  obj.photos.photo.forEach((v, i, a) => {
    const farm_id = v.farm;
    const server_id = v.server;
    const id = v.id;
    const secret = v.secret;
    const title = v.title;
    const imageURL = `https://farm${farm_id}.staticflickr.com/${server_id}/${id}_${secret}_m.jpg`;
    const htmlString = `<div><a href="${imageURL}"><img src="${imageURL}" alt="${title}"></a></div>`;
    view.push(htmlString);
  });
  return view.join('');
}
function displayView(view) {
  const result = document.getElementById('result');
  result.innerHTML = view;
}

const searchForm = document.getElementById('searchForm');
searchForm.onsubmit = event => {
  event.preventDefault();
  main();
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
