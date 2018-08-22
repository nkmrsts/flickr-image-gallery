import { API_KEY } from './config.js';

const API_ROOT = 'https://api.flickr.com/services/rest/';

class ImageGallery {
  constructor() {
    this.input = null;
    this.pageNum = 1;
    this.maxPage = null;
    this.handleEvents();
  }

  handleEvents() {
    const searchForm = document.getElementById('searchForm');
    searchForm.onsubmit = event => {
      event.preventDefault();
      this.search(getInput(), 1);
    };
    this.moreButton = document.getElementById('more');
    this.moreButton.addEventListener('click', () => {
      this.search(this.input, this.pageNum + 1);
    });

    window.addEventListener('click', event => {
      const item = event.target.closest('.resultItem');
      if (item) {
        event.preventDefault();
        const itemId = item.getAttribute('data-id');
        displayView(createInfoView(itemId));
      }
    });
  }

  search(input, num) {
    if (input.length === 0) {
      displayView('入力欄が空です。');
      return;
    }
    getPhotos(input, num)
      .then(obj => {
        console.log(this, obj);
        this.maxPage = obj.photos.pages;
        if (this.maxPage === 0) {
          return '画像が見つかりませんでした。';
        }
        return createSearchView(obj);
      })
      .then(view => displayView(view))
      .then(() => {
        this.createPager(num, input);
      })
      .catch(error => {
        console.error(`エラーが発生しました (${error})`);
      });
  }

  createPager(num, input) {
    if (num < this.maxPage) {
      this.input = input;
      this.pageNum = num;
      this.moreButton.style.display = 'block';
    } else {
      this.moreButton.style.display = 'none';
    }
  }
}

function fetchAPI(url) {
  return fetch(url)
    .then(response => {
      if (response.ok) return response;
      throw new Error(`${response.status}: ${response.statusText}`);
    })
    .catch(error => {
      throw new Error('ネットワークエラー');
    });
}

function getPhotos(text, page) {
  const url = `${API_ROOT}?method=flickr.photos.search&api_key=${API_KEY}&text=${text}&extras=description%2C+date_taken%2C+owner_name%2C+icon_server%2C+url_o%2Curl_m%2C+tags%2C+views%2C+url_o&per_page=16&page=${page}&format=json&nojsoncallback=1`;
  return fetchAPI(url).then(response => {
    const photosObj = response.json();
    return photosObj;
  });
}

function getInfo(id) {
  const url = `${API_ROOT}?method=flickr.photos.getInfo&api_key=${API_KEY}&photo_id=${id}`;
  return fetchAPI(url)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(xml => xml);
}

function getInput() {
  const { value } = document.getElementById('input');
  return encodeURIComponent(value);
}

const photosData = new Map();
function createSearchView(obj) {
  const view = [];
  obj.photos.photo.forEach(v => {
    photosData.set(v.id, v);
    const htmlString = `<div><a href="${v.url_o}" data-id="${
      v.id
    }" class="resultItem"><img src="${v.url_m}" alt="${v.title}"></a></div>`;
    view.push(htmlString);
  });
  return view.join('');
}

function createInfoView(id) {
  const data = photosData.get(id);
  let row = '';
  Object.keys(data).forEach(value => {
    row += `<tr><td>${value}</td><td>${data[value]}</td></tr>`;
  });
  const htmlString = `<table><tbody>${row}</tbody></table>`;
  return htmlString;

  /*
  const elm = {
    image: `<img src="${imageURL}">`,
    title: xml.getElementsByTagName('title')[0].textContent,
    description: xml.getElementsByTagName('description')[0].textContent,
    username: xml.getElementsByTagName('owner')[0].getAttribute('username')
  };
  */
}

function displayView(view) {
  const result = document.getElementById('result');
  result.innerHTML = view;
}

const imageGallery = new ImageGallery();
