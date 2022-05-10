export default class PageHeader {
	constructor(headerElement) {
		this._headerElement = headerElement;
		this._togglerElement = headerElement.querySelector('.page-header__toggler');

		this._setListeners();
	}

	_setListeners() {
		this._clickHandler = this._clickHandler.bind(this);

		this._togglerElement.addEventListener('click', this._clickHandler);
	}

	_clickHandler(evt) {
		evt.preventDefault();

		this._headerElement.classList.toggle('page-header--opened');
	}
}
