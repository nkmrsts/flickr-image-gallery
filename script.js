const ImageGallery = function() {
  this.input = null;
  this.pageNum = 1;
  this.maxPage = null;
  this.initialize();
};

ImageGallery.prototype.initialize = function() {
  const searchForm = document.getElementById('searchForm');
  searchForm.onsubmit = event => {
    event.preventDefault();
    this.pageNum = 1;
    this.search(getInput(), this.pageNum);
  };
  this.moreButton = document.getElementById('more');
  this.moreButton.addEventListener('click', () => {
    this.search(this.input, this.pageNum);
  });
};

ImageGallery.prototype.search = function(input, num) {
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
      return createView(obj);
    })
    .then(view => displayView(view))
    .then(() => {
      if (num < this.maxPage) {
        this.input = input;
        this.pageNum += 1;
        this.showReadMore();
      } else {
        this.hideReadMore();
      }
    })
    .catch(error => {
      console.error(`エラーが発生しました (${error})`);
    });
};

ImageGallery.prototype.showReadMore = function() {
  this.moreButton.style.display = 'block';
};

ImageGallery.prototype.hideReadMore = function() {
  this.moreButton.style.display = 'none';
};

function getPhotos(text, page) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const url = 'https://api.flickr.com/services/rest/';
    const apiKey = '';
    request.open(
      'GET',
      `${url}?method=flickr.photos.search&api_key=${apiKey}&text=${text}&per_page=16&page=${page}&format=json&nojsoncallback=1`
    );
    request.addEventListener('load', event => {
      if (event.target.status !== 200) {
        console.log(`Error: ${event.target.status}`);
        reject(new Error(`${event.target.status}: ${event.target.statusText}`));
      }
      const photosObj = JSON.parse(event.target.response);
      resolve(photosObj);
    });
    request.addEventListener('error', () => {
      console.error('Network Error');
      reject(new Error('ネットワークエラー'));
    });
    request.send();
  });
}

function getInput() {
  const { value } = document.getElementById('input');
  return encodeURIComponent(value);
}

function createView(obj) {
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
    const htmlString = `<div><a href="${imageURL}"><img src="${imageURL}" alt="${title}"></a></div>`;
    view.push(htmlString);
  });
  return view.join('');
}

function displayView(view) {
  const result = document.getElementById('result');
  result.innerHTML = view;
}

const imageGallery = new ImageGallery();
