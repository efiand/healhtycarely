import PageHeader from './components/page-header.js';
import Slider from './components/slider.js';
import { setupComponent } from './common/utils.js';

[
	['.page-header', PageHeader],
	['.slider__body', Slider]
].forEach(setupComponent);
