import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/edit-site';
import { PanelBody } from '@wordpress/components';
import SwtIcons from '../components/icons.js';
import { __ } from '@wordpress/i18n';
import { SwtRadioButton } from './components/radioButton.js';
import apiFetch from '@wordpress/api-fetch';
import React, { useState, useEffect } from 'react';

const SwtPluginSidebar = () => {
	const [ settings, setSettings ] = useState( {
		scroll_top: false,
	} );

	const restEditorPanelUrl = 'swt/v1/global_settings';

	// Store data into database
	const setData = async ( setting ) => {
		const sendData = { setting };

		try {
			await apiFetch( {
				path: restEditorPanelUrl,
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'X-WP-NONCE': spectraOne.nonce,
				},
				body: JSON.stringify( sendData ),
			} );
		} catch ( error ) {

		}
	};

	// Get data into database
	const getData = async () => {
		try {
			const response = await apiFetch( {
				path: restEditorPanelUrl,
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					'X-WP-NONCE': spectraOne.nonce,
				},
			} );

			if ( response ) {
				setSettings( response );
			}
		} catch ( error ) {

		}
	};

	// Only run once.
	useEffect( () => {
		getData();
	}, [] );

	return (
		<>
			<PluginSidebar
				name="swt-editor-sidebar"
				icon={ SwtIcons.logo }
				isPinnable={ true }
				title={ __( 'Spectra Global Settings', 'spectra-one' ) }
			>
				<PanelBody
					title={ __( 'Global features', 'spectra-one' ) }
					initialOpen={ true }
					className={ 'swt-global-features-panel' }
				>
					<SwtRadioButton setting={ settings } setSetting={ setSettings } id={ 'scroll_top' } setData={ setData } notice={ __( 'Scroll to top updated', 'spectra-one' ) } label={ __( 'Scroll To Top', 'spectra-one' ) } />
				</PanelBody>

			</PluginSidebar>
		</>
	);
};

registerPlugin( 'swt-editor-sidebar', { render: SwtPluginSidebar } );
