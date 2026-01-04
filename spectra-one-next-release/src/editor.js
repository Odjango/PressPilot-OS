import { registerPlugin } from '@wordpress/plugins';
import SwtSidebar from './extensions/panel/sidebar';
import { SwtComponents } from './extensions/panel/components.js';
import { addFilter } from '@wordpress/hooks';
import './extensions/editor/index.js';
import './block-extensions/index.js';
import './blocks/index.js';
import './admin/settings.js';

if ( spectraOne.is_spectra_plugin ) {
	addFilter(
		'spectra.page-sidebar.before',
		'swt/setting-list',
		function ( markup, props ) {
			return (
				<>
					{ markup }
					<SwtComponents { ...props } />
				</>
			);
		},
		10
	);
}

if ( ! spectraOne.is_spectra_plugin ) {
	registerPlugin( 'swt-page-level-settings', {
		render: SwtSidebar,
	} );
}
