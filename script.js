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
        this.showInfo(itemId);
      }
    });
  }

  showInfo(itemId) {
    getInfo(itemId)
      .then(data => createInfoView(data))
      .then(html => {
        displayView(html);
      })
      .catch(error => {
        console.error(`エラーが発生しました (${error})`);
      });
  }

  search(input, num) {
    console.log(input);
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
  const API_ROOT = 'https://api.flickr.com/services/rest/';
  const API_KEY = '';
  const url = `${API_ROOT}?method=flickr.photos.search&api_key=${API_KEY}&text=${text}&per_page=16&page=${page}&format=json&nojsoncallback=1`;
  return fetchAPI(url).then(response => {
    const photosObj = response.json();
    return photosObj;
  });
}

function getInfo(id) {
  const API_ROOT = 'https://api.flickr.com/services/rest/';
  const API_KEY = '';
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

function createSearchView(obj) {
  const view = [];
  obj.photos.photo.forEach(v => {
    const [farmId, serverId, id, secret, title] = [
      v.farm,
      v.server,
      v.id,
      v.secret,
      v.title
    ];
    const imageURL = `https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}_m.jpg`;
    const htmlString = `<div><a href="${imageURL}" data-id="${id}" class="resultItem"><img src="${imageURL}" alt="${title}"></a></div>`;
    view.push(htmlString);
  });
  return view.join('');
}

function createInfoView(xml) {
  let row = '';
  const photo = xml.getElementsByTagName('photo')[0];
  const imageURL = `https://farm${photo.getAttribute(
    'farm'
  )}.staticflickr.com/${photo.getAttribute('server')}/${photo.getAttribute(
    'id'
  )}_${photo.getAttribute('secret')}.jpg`;
  const elm = {
    image: `<img src="${imageURL}">`,
    title: xml.getElementsByTagName('title')[0].textContent,
    description: xml.getElementsByTagName('description')[0].textContent,
    username: xml.getElementsByTagName('owner')[0].getAttribute('username')
  };
  Object.keys(elm).forEach(key => {
    row += `<tr><td>${key}</td><td>${elm[key]}</td></tr>`;
  });
  const htmlString = `<table><tbody>${row}</tbody></table>`;
  return htmlString;
}

function displayView(view) {
  const result = document.getElementById('result');
  result.innerHTML = view;
}

const imageGallery = new ImageGallery();
