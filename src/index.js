import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import GetRequest from './fetchFoto';
import markup from './templates/markup.hbs';
import Notiflix from 'notiflix';
import Scrollbar from 'smooth-scrollbar';
import {refs} from './refs'

const ERROR_MESSAGE = 'Sorry, there are no images matching your search query. Please try again.';
const INFO_MESSAGE = "We're sorry, but you've reached the end of search results.";

let simplelightbox = new SimpleLightbox('.gallery a', {
  scrollZoom: false,
});

Scrollbar.init(document.querySelector('#my-scrollbar'));

refs.searchForm.addEventListener('submit', createGallery);
refs.searchForm.addEventListener('input', allowToSearch);
refs.submitBtn.setAttribute('disabled', true);

const request = new GetRequest();

const options = {
  root: null,
  rootMargin: '100px',
  treshold: 1,
};
const observer = new IntersectionObserver(onLoading, options);

async function onLoading(entries) {
  await entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadingImages();
    }
  });
}

function allowToSearch() {
  if (refs.input.value.trim() !== '') {
    refs.submitBtn.removeAttribute('disabled');
  } else refs.submitBtn.setAttribute('disabled', true);
}

async function loadingImages() {
  await request.getCards().then(renderCards).catch(console.log);
  if (
    request.length >= request.total &&
    request.total !== 0
  ) {
    return Notiflix.Notify.warning(
      INFO_MESSAGE
    );
  }
}

async function renderCards(images) {
  let newCard = await markup(images);
  refs.gallery.insertAdjacentHTML('beforeend', newCard);
  /* let simplelightbox = new SimpleLightbox('.gallery a'); */
  simplelightbox.refresh();
}

function clearContainer() {
  refs.gallery.innerHTML = '';
}

async function getImages() {
  clearContainer();
  request.resetPage();
  request.val = refs.input.value;
  let images = await request.getCards();
  return images;
}

async function createGallery(e) {
  e.preventDefault();
  await getImages().then(renderCards).catch(console.log);
  observer.observe(refs.trigger);
  if (request.arrLength > 0) {
    Notiflix.Notify.success(
      `Wow, you have got the ${request.total} results!!!`
    );
  } else if (request.arrLength === 0) {
    return Notiflix.Notify.failure(
      ERROR_MESSAGE
    );
  }
}