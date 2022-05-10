const CSS_CODE = `<link rel="stylesheet" href="${window.root}styles/vendor/swiper-bundle.min.css">`;

let isLoaded = false;

const load = () => new Promise((resolve) => {
	if (isLoaded) {
		resolve(true);
	}

	const jsElement = document.createElement('script');
	jsElement.src = `${window.root}scripts/vendor/swiper-bundle.min.js`;
	jsElement.addEventListener('load', () => {
		document.head.insertAdjacentHTML('beforeend', CSS_CODE);
		resolve(true);
	});
	jsElement.addEventListener('error', () => resolve(false));

	document.body.append(jsElement);
});

export default class Slider {
	constructor(sliderElement) {
		this._sliderElement = sliderElement;
		this._sliderContainer = sliderElement.closest('.slider');
		this._slider = null;

		load().then((flag) => {
			isLoaded = flag;
			if (!isLoaded) {
				return;
			}

			this._sliderContainer.classList.add('slider--ready');
			this._slider = new Swiper(this._sliderElement, {
				navigation: {
					nextEl: '.slider__control--next',
					prevEl: '.slider__control--prev'
				},
				slideClass: 'slider__item',
				wrapperClass: 'slider__list'
			});
		});
	}
}
